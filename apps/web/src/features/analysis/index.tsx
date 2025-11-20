import type React from "react";
import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { type AnalysisResponse, type Sensor } from "../../types";

import {
    Container,
    Header,
    Title,
    Subtitle,
    SelectionPanel,
    PanelHeader,
    CheckboxGroup,
    CheckboxLabel,
    ActionButton,
    ResultsGrid,
    ReportCard,
    ReportHeader,
    ReportBody,
    MetricGroup,
    GroupTitle,
    MetricsList,
    MetricCard,
    MetricHeader,
    MetricName,
    AnalysisText,
    StatsRow,
    StatItem,
    UrgencyBadge,
    ChartWrapper,
    ChartContainer,
} from "./styled";

export default function Analisis() {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);

    useEffect(() => {
        const loadSensors = async () => {
            try {
                const data = await api.getSensors();
                const validSensors = data.filter((s) => typeof s.sensorId === "string");
                setSensors(validSensors);
            } catch (error) {
                console.error("Error cargando sensores:", error);
            }
        };
        loadSensors();
    }, []);

    const handleSensorToggle = (sensorId: string) => {
        setSelectedSensors((prev) =>
            prev.includes(sensorId)
                ? prev.filter((id) => id !== sensorId)
                : [...prev, sensorId]
        );
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSensors.length === 0) {
            alert("Selecciona al menos un sensor");
            return;
        }

        setLoading(true);
        try {
            const data = await api.analyzeData(selectedSensors);
            setResult(data);
        } catch (error) {
            console.error("Error analizando datos:", error);
            alert("Error al analizar los datos.");
        } finally {
            setLoading(false);
        }
    };

    // Helper para iconos de tendencia
    const getTrendIcon = (trend: string) => {
        if (trend === "subiendo") return "📈";
        if (trend === "bajando") return "📉";
        return "➡️";
    };

    return (
        <Container>
            <Header>
                <Title>Diagnóstico Inteligente</Title>
                <Subtitle>Análisis predictivo de anomalías y tendencias en tiempo real.</Subtitle>
            </Header>

            <SelectionPanel>
                <form onSubmit={handleAnalyze}>
                    <PanelHeader>
                        <h3>Selección de Dispositivos</h3>
                        <ActionButton type="submit" disabled={loading || selectedSensors.length === 0}>
                            {loading ? "Procesando..." : "Ejecutar Análisis"}
                        </ActionButton>
                    </PanelHeader>
                    
                    <CheckboxGroup>
                        {sensors.map((sensor) => (
                            <CheckboxLabel 
                                key={sensor.sensorId} 
                                $checked={selectedSensors.includes(sensor.sensorId)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSensors.includes(sensor.sensorId)}
                                    onChange={() => handleSensorToggle(sensor.sensorId)}
                                />
                                <span style={{ fontWeight: 500, color: '#334155' }}>
                                    {sensor.name} 
                                    <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 400 }}> ({sensor.sensorId})</span>
                                </span>
                            </CheckboxLabel>
                        ))}
                    </CheckboxGroup>
                </form>
            </SelectionPanel>

            {result && (
                <ResultsGrid>
                    {result.report.map((sensorReport) => (
                        <ReportCard key={sensorReport.sensorId}>
                            <ReportHeader>
                                <h2>📊 Sensor: {sensorReport.sensorId}</h2>
                                <span style={{fontSize: 13, color: '#64748b'}}>
                                    Análisis generado: {new Date().toLocaleTimeString()}
                                </span>
                            </ReportHeader>

                            <ReportBody>
                                {/* Métricas por Categoría */}
                                {Object.entries(sensorReport.resumen).map(([category, metrics]) => (
                                    <MetricGroup key={category}>
                                        <GroupTitle>{category.toUpperCase()}</GroupTitle>
                                        
                                        <MetricsList>
                                            {Object.entries(metrics).map(([metricName, analysis]: [string, any]) => {
                                                if (!analysis.message) return null;
                                                
                                                return (
                                                    <MetricCard key={metricName} $urgency={analysis.urgencia}>
                                                        <MetricHeader>
                                                            <MetricName>{metricName}</MetricName>
                                                            <UrgencyBadge $urgency={analysis.urgencia}>
                                                                {analysis.urgencia}
                                                            </UrgencyBadge>
                                                        </MetricHeader>
                                                        
                                                        <AnalysisText>{analysis.message}</AnalysisText>
                                                        
                                                        <StatsRow>
                                                            <StatItem>
                                                                <span>Valor Actual</span>
                                                                <span>{analysis.valorActual?.toFixed(2) ?? "-"}</span>
                                                            </StatItem>
                                                            <StatItem>
                                                                <span>Tendencia</span>
                                                                <div style={{display:'flex', alignItems:'center', gap:4}}>
                                                                    {getTrendIcon(analysis.tendencia)}
                                                                    <span style={{fontSize: 14, fontWeight: 600}}>{analysis.tendencia}</span>
                                                                </div>
                                                            </StatItem>
                                                        </StatsRow>
                                                    </MetricCard>
                                                );
                                            })}
                                        </MetricsList>
                                    </MetricGroup>
                                ))}

                                {/* Gráficos */}
                                {sensorReport.chartData && Object.entries(sensorReport.chartData).map(([category, chartMetrics]) => (
                                    <MetricGroup key={`chart-${category}`}>
                                        <GroupTitle>Tendencias - {category}</GroupTitle>
                                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                                            {chartMetrics.map((chartMetric) => (
                                                <ChartWrapper key={chartMetric.metric}>
                                                    <h4 style={{ margin: '0 0 16px 0', color: '#475569', fontSize: 14 }}>
                                                        {chartMetric.metric}
                                                    </h4>
                                                    <ChartContainer>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={chartMetric.data}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                <XAxis 
                                                                    dataKey="timestamp" 
                                                                    tickFormatter={(val) => new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    tick={{fontSize: 11, fill: '#94a3b8'}}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />
                                                                <YAxis 
                                                                    tick={{fontSize: 11, fill: '#94a3b8'}}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />
                                                                <Tooltip 
                                                                    contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                                                    labelFormatter={(val) => new Date(val).toLocaleString()}
                                                                />
                                                                <Legend />
                                                                <Line 
                                                                    type="monotone" 
                                                                    dataKey="value" 
                                                                    name={chartMetric.metric}
                                                                    stroke="#2563eb" 
                                                                    strokeWidth={2} 
                                                                    dot={false} 
                                                                    activeDot={{r: 6}} 
                                                                />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </ChartWrapper>
                                            ))}
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