import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useReadingsStore } from "../../store/readingState";
import { useSensors } from "./hooks/useSensors";
import { useActiveSensors } from "./hooks/useActiveSensors";
import type { Sensor, Ingenio } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
import { api } from "../../lib/api";
import CreateSensorModal from "./components/CreateSensorModal";

import {
    Container,
    Header,
    Title,
    ActionButton,
    SearchInput,
    Select,
    FilterContainer,
    ButtonGroup,
    FilterButton,
    Grid,
    Card,
    CardHeader,
    CardTitleBlock,
    CardTitle,
    CardSubtitle,
    Badge,
    CardStatsGrid,
    StatBox,
    LastReadingText,
    CardActions,
    GhostButton,
    DangerTextButton,
    Loading,
    BadgeCount // Nuevo componente importado
} from "./styled";

import SensorForm from "./components/SensorForm";

export default function Sensores() {
    const navigate = useNavigate();
    const { user } = useSessionStore();
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Cargar ingenios si es superadmin
    useEffect(() => {
        if (isSuperAdmin) {
            api.getAllIngenios().then(setIngenios).catch(console.error);
        }
    }, [isSuperAdmin]);

    const {
        sensors,
        machines,
        filteredSensors,
        loading,
        searchTerm,
        setSearchTerm,
        reload,
        deactivateSensor,
        activateSensor,
    } = useSensors(selectedIngenioId);

    const [showForm, setShowForm] = useState(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    
    // Filtros: Agregamos 'unconfigured'
    const [filterMode, setFilterMode] =
        useState<"all" | "active" | "inactive" | "recent" | "disabled" | "unconfigured">("all");

    const [machineFilterId, setMachineFilterId] =
        useState<"all" | number>("all");

    const sensorMap = useReadingsStore((s) => s.sensorMap);
    const activeMap = useActiveSensors(sensors);

    const machineOptions = useMemo(() => {
        return machines
            .map((m) => ({
                id: m.id,
                name: m.name,
                code: m.code ?? null,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [machines]);

    const enrichedSensors = useMemo(() => {
        return filteredSensors.map((sensor) => {
            const key = sensor.sensorId ?? String(sensor.id);
            const readings = sensorMap.get(key) || [];
            const lastReading = readings.at(-1);

            let lastReadingTime: number | null = null;
            let lastStatus = "unknown";
            let severity = "-";
            let totalIssues = 0;
            let metricsCount = 0;

            if (lastReading) {
                lastReadingTime =
                    typeof lastReading.timestamp === "string"
                        ? Date.parse(lastReading.timestamp)
                        : Number(lastReading.timestamp);

                lastStatus = lastReading.status ?? "unknown";
                severity = lastReading.severityLevel?.toString() ?? "-";
                totalIssues = lastReading.totalIssues ?? 0;
                metricsCount = Object.keys(lastReading.metrics || {}).length;
            }

            // DETECCION: Si el nombre es exactamente "NOCONFIGURADO"
            const isUnconfigured = sensor.name === "NOCONFIGURADO";

            return {
                ...sensor,
                lastReading,
                lastReadingTime,
                lastStatus,
                severity,
                totalIssues,
                metricsCount,
                isActive: !!activeMap[key],
                isEnabled: sensor.active, 
                isUnconfigured, // Bandera para la UI
            };
        });
    }, [filteredSensors, sensorMap, activeMap]);

    // Contador para el badge rojo del botón de filtro
    const unconfiguredCount = useMemo(() => 
        enrichedSensors.filter(s => s.isUnconfigured && s.isEnabled).length, 
    [enrichedSensors]);

    // --- LÓGICA DE FILTRADO ---
    const displayedSensors = useMemo(() => {
        let base = enrichedSensors;

        // 1. Filtro por máquina
        if (machineFilterId !== "all") {
            base = base.filter((s) => s.machineId === machineFilterId);
        }

        // 2. Si el modo es 'disabled', mostramos SOLO los desactivados
        if (filterMode === "disabled") {
            return base.filter((s) => !s.isEnabled);
        }

        // 3. Para el resto de modos, ocultamos los desactivados por defecto
        base = base.filter((s) => s.isEnabled);

        // 4. Filtros específicos de estado
        switch (filterMode) {
            case "unconfigured": return base.filter((s) => s.isUnconfigured);
            case "active": return base.filter((s) => s.isActive && !s.isUnconfigured);
            case "inactive": return base.filter((s) => !s.isActive && !s.isUnconfigured);
            case "recent":
                return [...base]
                    .filter((s) => s.lastReadingTime)
                    .sort((a, b) => (b.lastReadingTime ?? 0) - (a.lastReadingTime ?? 0));
            default: return base; // 'all'
        }
    }, [enrichedSensors, machineFilterId, filterMode]);

    return (
        <Container>
            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div>
                        <Title>Sensores</Title>
                        <p style={{color: '#64748b', margin: '8px 0 0 0'}}>
                            Monitoreo en tiempo real del estado y configuración de dispositivos.
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <Select
                            value={selectedIngenioId || ""}
                            onChange={(e) => setSelectedIngenioId(e.target.value ? Number(e.target.value) : undefined)}
                            style={{ width: '200px', margin: 0 }}
                        >
                            <option value="">Todos los Ingenios</option>
                            {ingenios.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                        </Select>
                    )}
                </div>
                {isSuperAdmin && (
                    <ActionButton onClick={() => setShowCreateModal(true)}>
                        + Nuevo Sensor
                    </ActionButton>
                )}
            </Header>

            <FilterContainer>
                <SearchInput
                    placeholder="Buscar por nombre, tipo o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Select
                    value={machineFilterId === "all" ? "all" : String(machineFilterId)}
                    onChange={(e) =>
                        setMachineFilterId(
                            e.target.value === "all" ? "all" : Number(e.target.value)
                        )
                    }>
                    <option value="all">Todas las máquinas</option>
                    {machineOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} {m.code ? `(${m.code})` : ""}
                        </option>
                    ))}
                </Select>

                <ButtonGroup>
                    <FilterButton $active={filterMode === "all"} onClick={() => setFilterMode("all")}>
                        Todos
                    </FilterButton>

                    {/* BOTÓN "POR CONFIGURAR" */}
                    <FilterButton 
                        $active={filterMode === "unconfigured"} 
                        onClick={() => setFilterMode("unconfigured")}
                        style={{ position: 'relative' }}
                    >
                        Por Configurar
                        {unconfiguredCount > 0 && (
                            <BadgeCount>{unconfiguredCount}</BadgeCount>
                        )}
                    </FilterButton>

                    <FilterButton $active={filterMode === "active"} onClick={() => setFilterMode("active")}>
                        Online
                    </FilterButton>
                    <FilterButton $active={filterMode === "inactive"} onClick={() => setFilterMode("inactive")}>
                        Offline
                    </FilterButton>
                    <FilterButton $active={filterMode === "recent"} onClick={() => setFilterMode("recent")}>
                        Recientes
                    </FilterButton>
                    <FilterButton 
                        $active={filterMode === "disabled"} 
                        onClick={() => setFilterMode("disabled")}
                        style={{ borderLeft: '1px solid #e2e8f0', color: filterMode === 'disabled' ? '#dc2626' : '#94a3b8' }}
                    >
                        Deshabilitados
                    </FilterButton>
                </ButtonGroup>
            </FilterContainer>

            {loading ? (
                <Loading>Cargando sensores...</Loading>
            ) : (
                <Grid>
                    {displayedSensors.map((sensor) => {
                        let badgeStatus = "unknown";
                        let badgeText = "Desconocido";

                        if (!sensor.isEnabled) {
                            badgeStatus = "unknown";
                            badgeText = "Deshabilitado";
                        } else if (sensor.isUnconfigured) {
                            badgeStatus = "warning"; // ESTADO NUEVO
                            badgeText = "Sin Configurar";
                        } else if (sensor.isActive) {
                            badgeStatus = "active";
                            badgeText = "Online";
                        } else {
                            badgeStatus = "inactive";
                            badgeText = "Offline";
                        }

                        return (
                            <Card
                                key={sensor.id}
                                $isActive={sensor.isActive}
                                $isUnconfigured={sensor.isUnconfigured} // Pasamos la prop de estilo
                                style={{ opacity: sensor.isEnabled ? 1 : 0.7 }}
                                onClick={() => {
                                    // BLOQUEO DE NAVEGACIÓN
                                    if (sensor.isUnconfigured) {
                                        return; 
                                    }
                                    if (sensor.isEnabled) {
                                        navigate(`/sensor/${sensor.sensorId ?? sensor.id}`);
                                    }
                                }}
                            >
                                <CardHeader>
                                    <CardTitleBlock>
                                        <CardTitle>{sensor.name}</CardTitle>
                                        <CardSubtitle>
                                            {sensor.type}
                                            {sensor.location !== "NOCONFIGURADO" && 
                                                <span>• 📍 {sensor.location}</span>
                                            }
                                        </CardSubtitle>
                                    </CardTitleBlock>
                                    <Badge $status={badgeStatus}>
                                        {badgeText}
                                    </Badge>
                                </CardHeader>

                                <CardStatsGrid>
                                    <StatBox>
                                        <span>Severidad</span>
                                        <span style={{ color: sensor.severity !== '-' && Number(sensor.severity) > 1 ? '#ef4444' : 'inherit'}}>
                                            {sensor.severity}
                                        </span>
                                    </StatBox>
                                    <StatBox>
                                        <span>Issues</span>
                                        <span>{sensor.totalIssues}</span>
                                    </StatBox>
                                    <StatBox>
                                        <span>Métricas</span>
                                        <span>{sensor.metricsCount}</span>
                                    </StatBox>
                                </CardStatsGrid>
                                
                                {sensor.isEnabled && sensor.lastReadingTime && (
                                    <LastReadingText>
                                        Actualizado: {new Date(sensor.lastReadingTime).toLocaleTimeString()}
                                    </LastReadingText>
                                )}

                                <CardActions>
                                    {canManage && (
                                        <GhostButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Importante para que no intente navegar
                                                setEditingSensor(sensor);
                                                setShowForm(true);
                                            }}>
                                            {sensor.isUnconfigured ? "Configurar Ahora" : "Editar"}
                                        </GhostButton>
                                    )}

                                    {canManage && (
                                        sensor.isEnabled ? (
                                            <DangerTextButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if(confirm("¿Desactivar este sensor? Dejará de recibir datos.")) {
                                                        const sid = sensor.sensorId ?? String(sensor.id);
                                                        deactivateSensor(sid);
                                                    }
                                                }}>
                                                Desactivar
                                            </DangerTextButton>
                                        ) : (
                                            <GhostButton
                                                style={{ color: '#16a34a', fontWeight: 'bold' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const sid = sensor.sensorId ?? String(sensor.id);
                                                    activateSensor(sid);
                                                }}>
                                                Reactivar
                                            </GhostButton>
                                        )
                                    )}
                                </CardActions>
                            </Card>
                        );
                    })}
                </Grid>
            )}

            {showForm && editingSensor && (
                <SensorForm
                    sensor={editingSensor}
                    onClose={() => {
                        setShowForm(false);
                        setEditingSensor(null);
                    }}
                    onSave={reload}
                />
            )}

            {/* Modal de Crear Sensor */}
            {showCreateModal && (
                <CreateSensorModal
                    machines={machines} // Pasamos las máquinas que ya tienes cargadas
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                    reload(); // Recarga la lista para ver el nuevo sensor
                    // Opcional: Cambiar filtro a "Por Configurar" para verlo
                    setFilterMode("unconfigured"); 
                }}
            />
        )}
    </Container>
);
}