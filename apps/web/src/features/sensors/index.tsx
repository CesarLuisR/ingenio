import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useReadingsStore } from "../../store/readingState";
import { useSensors } from "./hooks/useSensors";
import { useActiveSensors } from "./hooks/useActiveSensors";
import type { Sensor } from "../../types";

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
} from "./styled"; // Asegúrate de importar desde el archivo nuevo

import SensorForm from "./components/SensorForm";

export default function Sensores() {
    const navigate = useNavigate();

    const {
        sensors,
        machines,
        filteredSensors,
        loading,
        searchTerm,
        setSearchTerm,
        reload,
        deactivateSensor,
    } = useSensors();

    const [showForm, setShowForm] = useState(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [filterMode, setFilterMode] =
        useState<"all" | "active" | "inactive" | "recent">("all");

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

    // ... (Lógica de enrichedSensors y displayedSensors permanece igual) ...
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
            };
        });
    }, [filteredSensors, sensorMap, activeMap]);

    const displayedSensors = useMemo(() => {
        let base = enrichedSensors;
        if (machineFilterId !== "all") {
            base = base.filter((s) => s.machineId === machineFilterId);
        }
        switch (filterMode) {
            case "active": return base.filter((s) => s.isActive);
            case "inactive": return base.filter((s) => !s.isActive);
            case "recent":
                return [...base]
                    .filter((s) => s.lastReadingTime)
                    .sort((a, b) => (b.lastReadingTime ?? 0) - (a.lastReadingTime ?? 0));
            default: return base;
        }
    }, [enrichedSensors, machineFilterId, filterMode]);

    return (
        <Container>
            <Header>
                <div>
                    <Title>Sensores</Title>
                    <p style={{color: '#64748b', margin: '8px 0 0 0'}}>
                        Monitoreo en tiempo real del estado y configuración de dispositivos.
                    </p>
                </div>
                <ActionButton onClick={() => alert("Próximamente")}>
                    + Nuevo Sensor
                </ActionButton>
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
                    <FilterButton $active={filterMode === "active"} onClick={() => setFilterMode("active")}>
                        Activos
                    </FilterButton>
                    <FilterButton $active={filterMode === "inactive"} onClick={() => setFilterMode("inactive")}>
                        Inactivos
                    </FilterButton>
                    <FilterButton $active={filterMode === "recent"} onClick={() => setFilterMode("recent")}>
                        Recientes
                    </FilterButton>
                </ButtonGroup>
            </FilterContainer>

            {loading ? (
                <Loading>Cargando sensores...</Loading>
            ) : (
                <Grid>
                    {displayedSensors.map((sensor) => {
                        const badgeStatus = sensor.isActive ? "active" : !sensor.isEnabled ? "inactive" : "unknown";

                        return (
                            <Card
                                key={sensor.id}
                                $isActive={sensor.isActive}
                                onClick={() => navigate(`/sensor/${sensor.sensorId ?? sensor.id}`)}
                            >
                                <CardHeader>
                                    <CardTitleBlock>
                                        <CardTitle>{sensor.name}</CardTitle>
                                        <CardSubtitle>
                                            {sensor.type}
                                            {sensor.location && <span>• 📍 {sensor.location}</span>}
                                        </CardSubtitle>
                                    </CardTitleBlock>
                                    <Badge $status={badgeStatus}>
                                        {badgeStatus === "active" ? "Online" : badgeStatus === "inactive" ? "Offline" : "Sin señal"}
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
                                
                                {sensor.lastReadingTime && (
                                    <LastReadingText>
                                        Actualizado: {new Date(sensor.lastReadingTime).toLocaleTimeString()}
                                    </LastReadingText>
                                )}

                                <CardActions>
                                    <GhostButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingSensor(sensor);
                                            setShowForm(true);
                                        }}>
                                        Editar
                                    </GhostButton>

                                    <DangerTextButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const sid = sensor.sensorId ?? String(sensor.id);
                                            deactivateSensor(sid);
                                        }}>
                                        Desactivar
                                    </DangerTextButton>
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
        </Container>
    );
}