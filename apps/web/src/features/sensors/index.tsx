import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useReadingsStore } from "../../store/readingState";
import { useSensors, type FilterMode } from "./hooks/useSensors";
import { useActiveSensors } from "./hooks/useActiveSensors";

import type { Sensor, Ingenio } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
import { api } from "../../lib/api";

import CreateSensorModal from "./components/CreateSensorModal";
import SensorForm from "./components/SensorForm";
// Asegúrate de que la ruta de importación sea correcta para tu proyecto
import SearchableSelect from "../shared/components/SearchableSelect"; 

import {
    Container,
    Header,
    Title,
    ActionButton,
    SearchInput,
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
    BadgeCount,
    PaginationWrapper,
    PaginationInfo,
    PaginationButtons,
    PaginationButton
} from "./styled";

export default function Sensores() {
    const navigate = useNavigate();
    const { user } = useSessionStore();
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    // -----------------------
    // ESTADOS DE FILTRO
    // -----------------------
    const [search, setSearch] = useState("");
    // Estado debounced para pasar al hook y evitar llamadas excesivas a la API
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    const [selectedMachine, setSelectedMachine] = useState<"all" | number>("all");
    const [filterMode, setFilterMode] = useState<FilterMode>("all");

    // Ingenios (Solo SuperAdmin)
    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (isSuperAdmin) {
            api.ingenios.getList().then(setIngenios).catch(console.error);
        }
    }, [isSuperAdmin]);

    // Opciones para SearchableSelect de Ingenios
    const ingenioOptions = useMemo(() => {
        return ingenios.map(i => ({ id: i.id, name: i.name, code: i.code || "" }));
    }, [ingenios]);

    // -----------------------
    // DEBOUNCE EFFECT
    // -----------------------
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // Espera 500ms después de que el usuario deje de escribir

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    // -----------------------
    // HOOK PRINCIPAL (API)
    // -----------------------
    const {
        sensors,
        filteredSensors,
        machines,
        loading,
        deactivateSensor,
        activateSensor,
        page,
        totalItems,
        totalPages,
        nextPage,
        prevPage,
        canNext,
        canPrev,
        reload
    } = useSensors(selectedIngenioId, {
        search: debouncedSearch, // Usamos la versión con retraso
        machineId: selectedMachine === "all" ? undefined : selectedMachine,
        filterMode: filterMode,
    });

    const sensorMap = useReadingsStore((s) => s.sensorMap);
    const activeMap = useActiveSensors(sensors as any);

    // Opciones para SearchableSelect de Máquinas (Filtro)
    const machineOptions = useMemo(() => {
        // Agregamos la opción "Todas" con ID 0 (asumimos que 0 no es un ID válido en DB)
        const allOption = { id: 0, name: "Todas las máquinas", code: "" };
        
        const mappedMachines = machines
            .map((m) => ({
                id: m.id,
                name: m.name,
                code: (m as any).code ?? ""
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return [allOption, ...mappedMachines];
    }, [machines]);

    // Enriquecer los sensores (Lógica existente)
    const enrichedSensors = useMemo(() => {
        return filteredSensors.map((sensor: any) => {
            const key = sensor.sensorId ?? sensor.id;
            const readings = sensorMap.get(key) || [];
            const lastReading = readings.at(-1);

            let lastReadingTime = null;
            let severity = "-";
            let totalIssues = 0;
            let metricsCount = 0;

            if (lastReading) {
                lastReadingTime = new Date(lastReading.timestamp).getTime();
                severity = lastReading.severityLevel.toString() ?? "-";
                totalIssues = lastReading.totalIssues ?? 0;
                metricsCount = Object.keys(lastReading.metrics || {}).length;
            }

            return {
                ...sensor,
                lastReading,
                lastReadingTime,
                isActive: activeMap[key] || false,
                isEnabled: sensor.active,
                severity,
                totalIssues,
                metricsCount,
                isUnconfigured: sensor.name === "NOCONFIGURADO",
            };
        });
    }, [filteredSensors, sensorMap, activeMap]);

    const unconfiguredCount = useMemo(
        () => enrichedSensors.filter((s) => s.isUnconfigured && s.isEnabled).length,
        [enrichedSensors]
    );

    // Filtro final según modo (frontend visual)
    const displayedSensors = useMemo(() => {
        let base = enrichedSensors;

        // El filtro de máquina ya se hace en backend (useSensors), pero si quisieras doble check:
        if (selectedMachine !== "all") base = base.filter((s) => s.machineId === selectedMachine);

        if (filterMode === "disabled") return base.filter((s) => !s.isEnabled);

        base = base.filter((s) => s.isEnabled);

        switch (filterMode) {
            case "unconfigured": return base.filter((s) => s.isUnconfigured);
            case "active": return base.filter((s) => s.isActive && !s.isUnconfigured);
            case "inactive": return base.filter((s) => !s.isActive && !s.isUnconfigured);
            case "recent":
                return [...base]
                    .filter((s) => s.lastReadingTime)
                    .sort((a, b) => b.lastReadingTime - a.lastReadingTime);
            default: return base;
        }
    }, [enrichedSensors, selectedMachine, filterMode]);

    // ----------------------------
    // MODALES
    // ----------------------------
    const [showForm, setShowForm] = useState(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // ----------------------------
    // RENDER
    // ----------------------------
    return (
        <Container>
            <Header>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    <div>
                        <Title>Sensores</Title>
                        <p style={{ color: "#64748b", marginTop: 4 }}>
                            Monitoreo en tiempo real del estado y configuración.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <div style={{ width: 250 }}>
                            <SearchableSelect
                                options={ingenioOptions}
                                value={selectedIngenioId || 0}
                                onChange={(val) => setSelectedIngenioId(val === 0 ? undefined : val)}
                                placeholder="Filtrar por Ingenio..."
                            />
                        </div>
                    )}
                </div>

                {canManage && (
                    <ActionButton onClick={() => setShowCreateModal(true)}>
                        + Nuevo Sensor
                    </ActionButton>
                )}
            </Header>

            {/* ---------------- FILTER BAR ---------------- */}
            <FilterContainer>
                <SearchInput
                    placeholder="Buscar nombre/tipo/ubicación…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Reemplazo del Select nativo de máquinas */}
                <div style={{ width: 250, zIndex: 20 }}>
                    <SearchableSelect
                        options={machineOptions}
                        value={selectedMachine === "all" ? 0 : selectedMachine}
                        onChange={(val) => setSelectedMachine(val === 0 ? "all" : val)}
                        placeholder="Todas las máquinas"
                    />
                </div>

                <ButtonGroup>
                    <FilterButton
                        $active={filterMode === "all"}
                        onClick={() => setFilterMode("all")}
                    >
                        Todos
                    </FilterButton>

                    <FilterButton
                        $active={filterMode === "unconfigured"}
                        onClick={() => setFilterMode("unconfigured")}
                        style={{ position: "relative" }}
                    >
                        Por Configurar
                        {unconfiguredCount > 0 && <BadgeCount>{unconfiguredCount}</BadgeCount>}
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
                        style={{
                            borderLeft: "1px solid #e2e8f0",
                            color: filterMode === "disabled" ? "#dc2626" : "#94a3b8",
                        }}
                    >
                        Deshabilitados
                    </FilterButton>
                </ButtonGroup>

                {/* BOTÓN FILTRAR ELIMINADO - Ahora es automático */}
            </FilterContainer>

            {/* ---------------- SENSOR GRID ---------------- */}
            {loading ? (
                <Loading>Cargando sensores...</Loading>
            ) : (
                <>
                    <Grid>
                        {displayedSensors.map((sensor: any) => {
                             const status = !sensor.isEnabled
                             ? "Deshabilitado"
                             : sensor.isUnconfigured
                             ? "Sin Configurar"
                             : sensor.isActive
                             ? "Online"
                             : "Offline";

                            return (
                                <Card
                                    key={sensor.id}
                                    $isActive={sensor.isActive}
                                    $isUnconfigured={sensor.isUnconfigured}
                                    style={{ opacity: sensor.isEnabled ? 1 : 0.6 }}
                                    onClick={() => {
                                        if (!sensor.isEnabled || sensor.isUnconfigured) return;
                                        navigate(`/sensor/${sensor.id}`);
                                    }}
                                >
                                    <CardHeader>
                                        <CardTitleBlock>
                                            <CardTitle>{sensor.name}</CardTitle>
                                            <CardSubtitle>
                                                {sensor.type}
                                                {sensor.location !== "NOCONFIGURADO" &&
                                                    <span> • 📍 {sensor.location}</span>}
                                            </CardSubtitle>
                                        </CardTitleBlock>
                                        <Badge
                                            $status={
                                                !sensor.isEnabled
                                                    ? "unknown"
                                                    : sensor.isUnconfigured
                                                    ? "warning"
                                                    : sensor.isActive
                                                    ? "active"
                                                    : "inactive"
                                            }
                                        >
                                            {status}
                                        </Badge>
                                    </CardHeader>

                                    <CardStatsGrid>
                                        <StatBox>
                                            <span>Severidad</span>
                                            <span style={{
                                                color: sensor.severity !== "-" &&
                                                    Number(sensor.severity) > 1
                                                    ? "#ef4444"
                                                    : "inherit"
                                            }}>
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

                                    {sensor.lastReadingTime && (
                                        <LastReadingText>
                                            Actualizado:{" "}
                                            {new Date(sensor.lastReadingTime).toLocaleTimeString()}
                                        </LastReadingText>
                                    )}

                                    <CardActions>
                                        {canManage && (
                                            <GhostButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSensor(sensor);
                                                    setShowForm(true);
                                                }}
                                            >
                                                {sensor.isUnconfigured ? "Configurar" : "Editar"}
                                            </GhostButton>
                                        )}

                                        {canManage && (
                                            sensor.isEnabled ? (
                                                <DangerTextButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm("¿Desactivar sensor?")) {
                                                            deactivateSensor(sensor.id);
                                                        }
                                                    }}
                                                >
                                                    Desactivar
                                                </DangerTextButton>
                                            ) : (
                                                <GhostButton
                                                    style={{ color: "#16a34a", fontWeight: 700 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        activateSensor(sensor.id);
                                                    }}
                                                >
                                                    Reactivar
                                                </GhostButton>
                                            )
                                        )}
                                    </CardActions>
                                </Card>
                            );
                        })}
                    </Grid>

                    {/* ---------------- PAGINACIÓN ---------------- */}
                    {totalItems > 0 && (
                        <PaginationWrapper>
                            <PaginationInfo>
                                Página {page} de {totalPages} — {totalItems} sensores
                            </PaginationInfo>

                            <PaginationButtons>
                                <PaginationButton
                                    onClick={prevPage}
                                    disabled={!canPrev}
                                >
                                    ⬅ Anterior
                                </PaginationButton>

                                <PaginationButton
                                    $primary
                                    onClick={nextPage}
                                    disabled={!canNext}
                                >
                                    Siguiente ➡
                                </PaginationButton>
                            </PaginationButtons>
                        </PaginationWrapper>

                    )}
                </>
            )}

            {/* ------ Modales ------ */}
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

            {showCreateModal && (
                <CreateSensorModal
                    machines={machines}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        reload();
                        setFilterMode("unconfigured"); // Reset filter para ver el nuevo
                    }}
                />
            )}
        </Container>
    );
}