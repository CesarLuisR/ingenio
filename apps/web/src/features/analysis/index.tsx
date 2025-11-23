import type React from "react";
import { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart
} from "recharts";
import { api } from "../../lib/api";
import { type AnalysisResponse, type Machine } from "../../types";
import { useSessionStore } from "../../store/sessionStore";

import {
    Container, Header, Title, Subtitle,
    SelectionPanel, PanelHeader, ActionButton,
    ResultsGrid, ReportCard, ReportHeader, ReportBody,
    MetricGroup, GroupTitle, MetricsList, MetricCard,
    MetricHeader, MetricName, AnalysisText, StatsRow, StatItem,
    UrgencyBadge, ChartWrapper, ChartContainer,
    SelectInput,
} from "./styled";

// --- Helpers ---
const getTrendIcon = (trend: string) => {
    if (trend === "subiendo") return "📈";
    if (trend === "bajando") return "📉";
    return "➡️";
};

// Función para calcular la línea de tendencia visual
const addTrendLine = (data: any[]) => {
    if (!data || data.length < 2) return data;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach((point, i) => {
        const x = i; 
        const y = point.value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((point, i) => ({
        ...point,
        trend: slope * i + intercept
    }));
};

export default function Analisis() {
    const { user } = useSessionStore();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [analyzedMachine, setAnalyzedMachine] = useState<any>(null);

    useEffect(() => {
        const loadMachines = async () => {
            try {
                const data = await api.getMachines();
                const activeMachines = data.filter(m => m.active);
                setMachines(activeMachines);
            } catch (error) {
                console.error("Error cargando máquinas:", error);
            }
        };
        loadMachines();
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMachineId) {
            alert("Selecciona una máquina para analizar");
            return;
        }

        setLoading(true);
        setResult(null);
        setAnalyzedMachine(null);

        try {
            const response = await api.analyzeMachine(Number(selectedMachineId));
            setResult(response.analysis);
            setAnalyzedMachine(response.machine);
        } catch (error: any) {
            console.error("Error analizando datos:", error);
            const msg = error.message || "Error al analizar los datos.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <Title>Diagnóstico Inteligente</Title>
                <Subtitle>Análisis predictivo de anomalías por maquinaria.</Subtitle>
            </Header>

            <SelectionPanel>
                <form onSubmit={handleAnalyze}>
                    <PanelHeader>
                        <h3>Selección de Maquinaria</h3>
                        <ActionButton type="submit" disabled={loading || !selectedMachineId}>
                            {loading ? "Analizando..." : "Ejecutar Diagnóstico"}
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

            {result && analyzedMachine && (
                <ResultsGrid>
                    <div style={{ gridColumn: '1 / -1', marginBottom: 16 }}>
                        <h2 style={{ margin: 0, color: '#1e293b' }}>
                            Reporte: {analyzedMachine.name}
                        </h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                            Código: {analyzedMachine.code} • Fecha: {new Date(result.timestamp).toLocaleString()}
                        </p>
                    </div>

                    {result.report.map((sensorReport) => (
                        <ReportCard key={sensorReport.sensorId}>
                            <ReportHeader>
                                <h2>📡 Sensor: {sensorReport.sensorId}</h2>
                            </ReportHeader>

                            <ReportBody>
                                {/* 1. Métricas Numéricas (RESUMEN) */}
                                {Object.entries(sensorReport.resumen).map(([category, metrics]) => (
                                    <MetricGroup key={category}>
                                        <GroupTitle>{category.toUpperCase()}</GroupTitle>
                                        <MetricsList>
                                            {Object.entries(metrics).map(([metricName, analysis]: [string, any]) => {
                                                
                                                // CORRECCIÓN: Solo verificamos que el objeto analysis exista.
                                                // Ya no exigimos que tenga 'message' para mostrarlo.
                                                if (!analysis) return null;
                                                
                                                return (
                                                    <MetricCard key={metricName} $urgency={analysis.urgencia || 'normal'}>
                                                        <MetricHeader>
                                                            <MetricName>{metricName}</MetricName>
                                                            <UrgencyBadge $urgency={analysis.urgencia || 'normal'}>
                                                                {analysis.urgencia || 'Normal'}
                                                            </UrgencyBadge>
                                                        </MetricHeader>
                                                        
                                                        {/* Si hay mensaje, lo mostramos. Si no, un texto genérico. */}
                                                        <AnalysisText>
                                                            {analysis.message || "Análisis estadístico completado sin observaciones textuales."}
                                                        </AnalysisText>
                                                        
                                                        <StatsRow>
                                                            <StatItem>
                                                                <span>Valor Actual</span>
                                                                <span>{analysis.valorActual != null ? Number(analysis.valorActual).toFixed(2) : "-"}</span>
                                                            </StatItem>
                                                            
                                                            <StatItem>
                                                                <span>Tendencia</span>
                                                                <div style={{display:'flex', alignItems:'center', gap:4}}>
                                                                    <span>{getTrendIcon(analysis.tendencia)}</span>
                                                                    <span style={{fontSize: 14, fontWeight: 600}}>
                                                                        {analysis.tendencia || '-'}
                                                                    </span>
                                                                </div>
                                                            </StatItem>

                                                            {/* Hemos quitado la pendiente numérica aquí para limpiar la vista */}
                                                        </StatsRow>
                                                    </MetricCard>
                                                );
                                            })}
                                        </MetricsList>
                                    </MetricGroup>
                                ))}

                                {/* 2. Gráficos con Línea de Tendencia */}
                                {sensorReport.chartData && Object.entries(sensorReport.chartData).map(([category, chartMetrics]) => (
                                    <MetricGroup key={`chart-${category}`}>
                                        <GroupTitle>Gráficos - {category}</GroupTitle>
                                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                                            {chartMetrics.map((chartMetric) => {
                                                const dataWithTrend = addTrendLine(chartMetric.data);

                                                return (
                                                    <ChartWrapper key={chartMetric.metric}>
                                                        <h4 style={{ margin: '0 0 16px 0', color: '#475569', fontSize: 14 }}>
                                                            {chartMetric.metric}
                                                        </h4>
                                                        <ChartContainer>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <ComposedChart data={dataWithTrend}>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                    <XAxis 
                                                                        dataKey="timestamp" 
                                                                        tickFormatter={(val) => new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                        tick={{fontSize: 11, fill: '#94a3b8'}}
                                                                        axisLine={false}
                                                                        tickLine={false}
                                                                        minTickGap={30}
                                                                    />
                                                                    <YAxis 
                                                                        tick={{fontSize: 11, fill: '#94a3b8'}}
                                                                        axisLine={false}
                                                                        tickLine={false}
                                                                        width={40}
                                                                        domain={['auto', 'auto']}
                                                                    />
                                                                    <Tooltip 
                                                                        contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                                                        labelFormatter={(val) => new Date(val).toLocaleString()}
                                                                        formatter={(value: any, name: string) => [
                                                                            typeof value === 'number' ? value.toFixed(2) : value,
                                                                            name === 'trend' ? 'Tendencia' : chartMetric.metric
                                                                        ]}
                                                                    />
                                                                    <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                                                                    
                                                                    {/* Línea de Datos Reales */}
                                                                    <Line 
                                                                        type="monotone" 
                                                                        dataKey="value" 
                                                                        name={chartMetric.metric}
                                                                        stroke="#2563eb" 
                                                                        strokeWidth={2} 
                                                                        dot={false} 
                                                                        activeDot={{r: 6}} 
                                                                    />

                                                                    {/* Línea de Tendencia (Naranja Punteada) */}
                                                                    <Line 
                                                                        type="linear" 
                                                                        dataKey="trend" 
                                                                        name="Tendencia"
                                                                        stroke="#f97316"
                                                                        strokeWidth={2} 
                                                                        strokeDasharray="5 5"
                                                                        dot={false} 
                                                                        activeDot={false}
                                                                    />
                                                                </ComposedChart>
                                                            </ResponsiveContainer>
                                                        </ChartContainer>
                                                    </ChartWrapper>
                                                );
                                            })}
                                        </div>
                                    </MetricGroup>
                                ))}
                            </ReportBody>
                        </ReportCard>
                    ))}
                </ResultsGrid>
            )}
        </Container>
    );
}