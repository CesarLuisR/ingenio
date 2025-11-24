import type React from "react";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { type MachineAnalysisResponse, type Machine } from "../../types";
import { useSessionStore } from "../../store/sessionStore";

// Importamos el componente nuevo
import SensorAnalysisCard from "./components/SensorAnalysisCard";

import {
    Container, Header, Title, Subtitle,
    SelectionPanel, PanelHeader, ActionButton,
    ResultsGrid,
    SelectInput,
} from "./styled";

export default function Analisis() {
    const { user } = useSessionStore();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [fullResult, setFullResult] = useState<MachineAnalysisResponse | null>(null);

    useEffect(() => {
        const loadMachines = async () => {
            try {
                const data = await api.getMachines();
                setMachines(data.filter(m => m.active));
            } catch (error) {
                console.error(error);
            }
        };
        loadMachines();
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMachineId) return alert("Selecciona una máquina");

        setLoading(true);
        setFullResult(null);

        try {
            const response = await api.analyzeMachine(Number(selectedMachineId));
            setFullResult(response);
            console.log(response);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error al analizar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <Title>Diagnóstico Inteligente IA</Title>
                <Subtitle>Predicción de vida útil (RUL) y detección de anomalías.</Subtitle>
            </Header>

            <SelectionPanel>
                <form onSubmit={handleAnalyze}>
                    <PanelHeader>
                        <h3>Selección de Maquinaria</h3>
                        <ActionButton type="submit" disabled={loading || !selectedMachineId}>
                            {loading ? "Procesando IA..." : "Ejecutar Diagnóstico"}
                        </ActionButton>
                    </PanelHeader>
                    
                    <div style={{ maxWidth: '400px' }}>
                        <label style={{ display:'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>
                            Máquina a analizar:
                        </label>
                        <SelectInput
                            value={selectedMachineId}
                            onChange={(e: any) => setSelectedMachineId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Selecciona una máquina --</option>
                            {machines.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} {m.code ? `(${m.code})` : ""}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                </form>
            </SelectionPanel>

            {fullResult && fullResult.analysis && (
                <ResultsGrid>
                    <div style={{ gridColumn: '1 / -1', marginBottom: 16 }}>
                        <h2 style={{ margin: 0, color: '#1e293b' }}>Reporte: {fullResult.machine.name}</h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                            {new Date(fullResult.analysis.timestamp).toLocaleString()}
                        </p>
                    </div>

                    {/* Usamos el nuevo componente modular por sensor */}
                    {fullResult.analysis.report.map((sensorReport) => (
                        <SensorAnalysisCard 
                            key={sensorReport.sensorId} 
                            report={sensorReport} 
                        />
                    ))}
                </ResultsGrid>
            )}
        </Container>
    );
}