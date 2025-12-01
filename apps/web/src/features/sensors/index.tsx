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
import SearchableSelect from "../shared/components/SearchableSelect";

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
    BadgeCount
} from "./styled";

export default function Sensores() {
    const navigate = useNavigate();
    const { user } = useSessionStore();
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    // Ingenios
    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (isSuperAdmin) {
            api.ingenios.getList().then(setIngenios).catch(console.error);
        }
    }, [isSuperAdmin]);

    const ingenioOptions = useMemo(() => {
        const all = { id: 0, name: "🏢 Todos los Ingenios", code: "" };
        return [all, ...ingenios];
    }, [ingenios]);

    // -----------------------
    // TEMPORARY FILTER STATES (UI)
    // -----------------------
    const [tempSearch, setTempSearch] = useState("");
    const [tempMachine, setTempMachine] = useState<"all" | number>("all");
    const [tempMode, setTempMode] = useState<FilterMode>("all");

    // -----------------------
    // APPLIED FILTER STATES (backend)
    // -----------------------
    const [appliedSearch, setAppliedSearch] = useState("");
    const [appliedMachine, setAppliedMachine] = useState<"all" | number>("all");
    const [appliedMode, setAppliedMode] = useState<FilterMode>("all");

    // Hook principal de sensores
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
        search: appliedSearch,
        machineId: appliedMachine === "all" ? undefined : appliedMachine,
        filterMode: appliedMode,
    });

    const sensorMap = useReadingsStore((s) => s.sensorMap);
    const activeMap = useActiveSensors(sensors as any);

    const machineOptions = useMemo(() => {
        return machines
            .map((m) => ({
                id: m.id,
                name: m.name,
                code: (m as any).code ?? null
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [machines]);

    // Enriquecer los sensores
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

    // Filtro final según modo (frontend)
    const displayedSensors = useMemo(() => {
        let base = enrichedSensors;

        if (appliedMachine !== "all") base = base.filter((s) => s.machineId === appliedMachine);

        if (appliedMode === "disabled") return base.filter((s) => !s.isEnabled);

        base = base.filter((s) => s.isEnabled);

        switch (appliedMode) {
            case "unconfigured": return base.filter((s) => s.isUnconfigured);
            case "active": return base.filter((s) => s.isActive && !s.isUnconfigured);
            case "inactive": return base.filter((s) => !s.isActive && !s.isUnconfigured);
            case "recent":
                return [...base]
                    .filter((s) => s.lastReadingTime)
                    .sort((a, b) => b.lastReadingTime - a.lastReadingTime);
            default: return base;
        }
    }, [enrichedSensors, appliedMachine, appliedMode]);

    // ----------------------------
    // MODALES
    // ----------------------------
    const [showForm, setShowForm] = useState(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // ----------------------------
    // ACCIÓN BOTÓN FILTRAR
    // ----------------------------
    const applyFilters = () => {
        setAppliedSearch(tempSearch);
        setAppliedMachine(tempMachine);
        setAppliedMode(tempMode);
    };

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
                        <div style={{ width: 220 }}>
                            <SearchableSelect
                                options={ingenioOptions}
                                value={selectedIngenioId || 0}
                                onChange={(val) => setSelectedIngenioId(val || undefined)}
                                placeholder="Ingenio..."
                            />
                        </div>
                    )}
                </div>

                {isSuperAdmin && (
                    <ActionButton onClick={() => setShowCreateModal(true)}>
                        + Nuevo Sensor
                    </ActionButton>
                )}
            </Header>

            {/* ---------------- FILTER BAR ---------------- */}
            <FilterContainer>
                <SearchInput
                    placeholder="Buscar nombre/tipo/ubicación…"
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
                />

                <Select
                    value={tempMachine === "all" ? "all" : String(tempMachine)}
                    onChange={(e) =>
                        setTempMachine(
                            e.target.value === "all" ? "all" : Number(e.target.value)
                        )
                    }
                >
                    <option value="all">Todas las máquinas</option>
                    {machineOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} {m.code ? `(${m.code})` : ""}
                        </option>
                    ))}
                </Select>

                <ButtonGroup>
                    <FilterButton
                        $active={tempMode === "all"}
                        onClick={() => setTempMode("all")}
                    >
                        Todos
                    </FilterButton>

                    <FilterButton
                        $active={tempMode === "unconfigured"}
                        onClick={() => setTempMode("unconfigured")}
                        style={{ position: "relative" }}
                    >
                        Por Configurar
                        {unconfiguredCount > 0 && <BadgeCount>{unconfiguredCount}</BadgeCount>}
                    </FilterButton>

                    <FilterButton $active={tempMode === "active"} onClick={() => setTempMode("active")}>
                        Online
                    </FilterButton>

                    <FilterButton $active={tempMode === "inactive"} onClick={() => setTempMode("inactive")}>
                        Offline
                    </FilterButton>

                    <FilterButton $active={tempMode === "recent"} onClick={() => setTempMode("recent")}>
                        Recientes
                    </FilterButton>

                    <FilterButton
                        $active={tempMode === "disabled"}
                        onClick={() => setTempMode("disabled")}
                        style={{
                            borderLeft: "1px solid #e2e8f0",
                            color: tempMode === "disabled" ? "#dc2626" : "#94a3b8",
                        }}
                    >
                        Deshabilitados
                    </FilterButton>
                </ButtonGroup>

                {/* BOTÓN FILTRAR */}
                <ActionButton
                    style={{ marginLeft: 12, background: "#2563eb", color: "white" }}
                    onClick={applyFilters}
                >
                    Filtrar
                </ActionButton>
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

                    {/* ---------------- PAGINACIÓN NUEVA ---------------- */}
                    {totalItems > 0 && (
                        <div
                            style={{
                                marginTop: 24,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "16px 20px",
                                background: "#f1f5f9",
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <span style={{ fontSize: 14, color: "#475569" }}>
                                Página {page} de {totalPages} — {totalItems} sensores
                            </span>

                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    onClick={prevPage}
                                    disabled={!canPrev}
                                    style={{
                                        padding: "8px 14px",
                                        background: canPrev ? "#e2e8f0" : "#cbd5e1",
                                        border: "none",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: canPrev ? "pointer" : "not-allowed",
                                        transition: "0.2s",
                                    }}
                                >
                                    ⬅ Anterior
                                </button>

                                <button
                                    onClick={nextPage}
                                    disabled={!canNext}
                                    style={{
                                        padding: "8px 14px",
                                        background: canNext ? "#3b82f6" : "#93c5fd",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: canNext ? "pointer" : "not-allowed",
                                        transition: "0.2s",
                                    }}
                                >
                                    Siguiente ➡
                                </button>
                            </div>
                        </div>
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
                        setAppliedMode("unconfigured");
                    }}
                />
            )}
        </Container>
    );
}
