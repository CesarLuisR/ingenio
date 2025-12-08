import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { type MachineAnalysisResponse, type Machine } from "../../types";

import SensorAnalysisCard from "./components/SensorAnalysisCard";
import SearchableSelect from "../shared/components/SearchableSelect";

import {
    Container, Header, Title, SubTitle,
    SelectionPanel, PanelHeader, ActionButton,
    TableContainer, TableHeader, TableRow, Cell,
    StatusBadge, ExpandButton, ExpandedContent,
    EmptyStateTable
} from "./styled";

export default function Analisis() {
    const location = useLocation();

    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [newResult, setNewResult] = useState<MachineAnalysisResponse | null>(null);

    // CARGAR MÁQUINAS
    useEffect(() => {
        loadMachines();
    }, []);

    const loadMachines = async () => {
        try {
            const data = await api.machines.getList();

            // No filtramos lastAnalysis para que siempre aparezcan en historial si existe
            setMachines(data);
        } catch (err) {
            console.error(err);
        }
    };

    // PRELOAD VIA NAVIGATE
    useEffect(() => {
        if (location.state?.preloadedResult) {
            const pre = location.state.preloadedResult;
            setSelectedMachineId(String(pre.machine.id));
            setNewResult(pre);
        }
    }, [location]);

    // OPCIONES SELECT
    const machineOptions = useMemo(() => {
        return machines
            .map(m => ({ id: m.id, name: m.name, code: m.code }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [machines]);

    // EJECUTAR ANÁLISIS NUEVO
    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMachineId) return alert("Selecciona una máquina.");

        setLoading(true);
        setNewResult(null);

        try {
            const response = await api.analyzeMachine(Number(selectedMachineId));
            setNewResult(response);
            await loadMachines();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Error al procesar análisis.");
        } finally {
            setLoading(false);
        }
    };

    // DETERMINAR ESTADO VISUAL
    const getAnalysisStatus = (analysis: any) => {
        if (!analysis || !Array.isArray(analysis?.report))
            return { label: "Sin datos", type: "neutral" };

        const entries = analysis.report;

        const critical = entries.some((r: any) =>
            r?.urgency?.includes("alta") || r?.urgency?.includes("fuera")
        );
        if (critical) return { label: "Crítico", type: "danger" };

        const warn = entries.some((r: any) => r?.urgency === "moderada");
        if (warn) return { label: "Revisar", type: "warning" };

        return { label: "Normal", type: "success" };
    };

    // HISTORIAL (YA FUNCIONA)
    const machinesWithHistory = useMemo(() => {
        return machines
            .filter(m => m.lastAnalysis != null)
            .sort((a, b) =>
                new Date(b.lastAnalyzedAt || 0).getTime()
                - new Date(a.lastAnalyzedAt || 0).getTime()
            );
    }, [machines]);

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <Container>

            <Header>
                <div>
                    <Title>Diagnóstico Inteligente IA</Title>
                    <SubTitle>
                        Ejecuta diagnósticos o revisa la predicción de vida útil y anomalías.
                    </SubTitle>
                </div>
            </Header>

            {/* PANEL DE NUEVO ANÁLISIS */}
            <SelectionPanel>

                <form onSubmit={handleAnalyze}>
                    <PanelHeader>
                        <h3>Ejecutar Nuevo Diagnóstico</h3>

                        <div style={{ 
                            display: "flex", 
                            gap: 10, 
                            alignItems: "stretch", // O "center" si prefieres, pero stretch ayuda en móvil
                            flexWrap: "wrap" // <--- ESTO ES LA CLAVE
                        }}>
                            {/* flex: "1 1 300px" significa:
                            - 1: grow (crece si hay espacio)
                            - 1: shrink (se encoge si es necesario)
                            - 300px: basis (ancho ideal base)
                            */}
                            <div style={{ flex: "1 1 300px" }}>
                                <SearchableSelect
                                    options={machineOptions}
                                    value={selectedMachineId ? Number(selectedMachineId) : undefined}
                                    onChange={(v) => setSelectedMachineId(String(v))}
                                    placeholder="Buscar máquina..."
                                    disabled={loading}
                                />
                            </div>

                            {/* El botón ocupará su tamaño natural, 
                                pero si baja de línea, podrías querer que ocupe el 100% 
                                agregando flex: "1 1 auto" aquí también si lo deseas.
                            */}
                            <ActionButton 
                                disabled={!selectedMachineId || loading}
                                style={{ whiteSpace: "nowrap" }} // Evita que el texto del botón se rompa feo
                            >
                                {loading ? "Procesando..." : "Analizar Ahora"}
                            </ActionButton>
                        </div>
                    </PanelHeader>
                </form>

                {/* RESULTADO NUEVO */}
                {newResult && (
                    <div style={{ marginTop: 24 }}>
                        <h4 style={{ marginBottom: 16 }}>
                            Resultado: {newResult.machine.name}
                        </h4>

                        {Array.isArray(newResult.analysis?.report) ? (
                            <div style={{ display: "grid", gap: 24 }}>
                                {newResult.analysis.report.map((s: any) => (
                                    <SensorAnalysisCard key={s.sensorId} report={s} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: "#64748b" }}>
                                Este análisis no contiene datos de sensores.
                            </p>
                        )}
                    </div>
                )}

            </SelectionPanel>

            {/* HISTORIAL */}
            <div>

                <h3 style={{ marginBottom: 16, fontSize: 18 }}>
                    Historial de Análisis Generados
                </h3>

                <TableContainer>

                    <TableHeader>
                        <Cell style={{ width: "40%" }}>Máquina</Cell>
                        <Cell style={{ width: "25%" }}>Fecha</Cell>
                        <Cell style={{ width: "20%" }}>Estado</Cell>
                        <Cell style={{ width: "15%", textAlign: "right" }}>Detalle</Cell>
                    </TableHeader>

                    {machinesWithHistory.length === 0 && (
                        <EmptyStateTable>No hay análisis históricos.</EmptyStateTable>
                    )}

                    {machinesWithHistory.map((m) => {
                        const expanded = expandedRows[m.id];
                        const status = getAnalysisStatus(m.lastAnalysis);

                        return (
                            <div key={m.id}>

                                <TableRow onClick={() => toggleRow(m.id)} $expanded={expanded}>
                                    <Cell>
                                        <strong>{m.name}</strong>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>{m.code}</div>
                                    </Cell>

                                    <Cell>
                                        {m.lastAnalyzedAt
                                            ? new Date(m.lastAnalyzedAt).toLocaleString()
                                            : "Desconocida"}
                                    </Cell>

                                    <Cell>
                                        <StatusBadge $type={status.type}>{status.label}</StatusBadge>
                                    </Cell>

                                    <Cell style={{ textAlign: "right" }}>
                                        <ExpandButton $expanded={expanded}>
                                            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </ExpandButton>
                                    </Cell>
                                </TableRow>

                                {expanded && (
                                    <ExpandedContent>

                                        {!m.lastAnalysis?.report?.length && (
                                            <p style={{ color: "#64748b", fontStyle: "italic" }}>
                                                Este análisis no contiene datos de sensores.
                                            </p>
                                        )}

                                        {m.lastAnalysis?.report?.map((sr: any) => (
                                            <SensorAnalysisCard
                                                key={`${m.id}-${sr.sensorId}`}
                                                report={sr}
                                            />
                                        ))}
                                    </ExpandedContent>
                                )}

                            </div>
                        );
                    })}

                </TableContainer>

            </div>

        </Container>
    );
}
