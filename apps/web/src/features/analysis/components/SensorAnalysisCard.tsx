import { useState } from "react";
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
    ReportCard, ReportHeader, ReportBody, MetricGroup, GroupTitle, MetricsList, MetricCard,
    MetricHeader, MetricName, UrgencyBadge, AnalysisText, StatsRow, StatItem, ChartWrapper, ChartContainer
} from "../styled";
import type { SensorReport } from "../../../types";

// --- Helpers ---
const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return "📈";
    if (trend === "decreasing") return "📉";
    return "➡️";
};

const addTrendLine = (data: any[]) => {
    if (!data || data.length < 2) return data;
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    data.forEach((point, i) => {
        const x = i; const y = point.value;
        sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return data.map((point, i) => ({ ...point, trend: slope * i + intercept }));
};

interface Props {
    report: SensorReport;
}

export default function SensorAnalysisCard({ report }: Props) {
    // Estado para controlar qué vista se muestra: 'real' (Histórico) o 'ai' (Predictivo)
    const [viewMode, setViewMode] = useState<'real' | 'ai'>('real');

    return (
        <ReportCard>
            <ReportHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2>📡 Sensor: {report.sensorId}</h2>
                </div>
                
                {/* SWITCH DE VISTAS */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 8, gap: 4 }}>
                    <button
                        onClick={() => setViewMode('real')}
                        style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: viewMode === 'real' ? 'white' : 'transparent',
                            color: viewMode === 'real' ? '#2563eb' : '#64748b',
                            boxShadow: viewMode === 'real' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Histórico Real
                    </button>
                    <button
                        onClick={() => setViewMode('ai')}
                        style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: viewMode === 'ai' ? 'white' : 'transparent',
                            color: viewMode === 'ai' ? '#7c3aed' : '#64748b', // Violeta para IA
                            boxShadow: viewMode === 'ai' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Predicción IA
                    </button>
                </div>
            </ReportHeader>

            <ReportBody>
                {/* 1. MÉTRICAS (Siempre visibles) */}
                {Object.entries(report.resumen).map(([category, metrics]) => (
                    <MetricGroup key={category}>
                        <GroupTitle>{category.toUpperCase()}</GroupTitle>
                        <MetricsList>
                            {Object.entries(metrics).map(([metricName, analysis]: [string, any]) => {
                                if (!analysis) return null;
                                return (
                                    <MetricCard key={metricName} $urgency={analysis.urgencia || 'normal'}>
                                        <MetricHeader>
                                            <MetricName>{metricName}</MetricName>
                                            <UrgencyBadge $urgency={analysis.urgencia || 'normal'}>{analysis.urgencia}</UrgencyBadge>
                                        </MetricHeader>
                                        <AnalysisText>{analysis.recommendation || analysis.message}</AnalysisText>
                                        <StatsRow>
                                            {analysis.rulHours !== null && (
                                                <StatItem>
                                                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>RUL</span>
                                                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{analysis.rulHours}h</span>
                                                </StatItem>
                                            )}
                                            <StatItem>
                                                <span>Actual</span>
                                                <span>{analysis.currentValue?.toFixed(2) ?? "-"}</span>
                                            </StatItem>
                                            <StatItem>
                                                <span>Tendencia</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span>{getTrendIcon(analysis.trend)}</span>
                                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{analysis.trend}</span>
                                                </div>
                                            </StatItem>
                                            {viewMode === 'ai' && (
                                                <StatItem>
                                                    <span style={{color:'#7c3aed'}}>Futuro (24h)</span>
                                                    <span style={{color:'#7c3aed', fontWeight:600}}>{analysis.predictedValue24h?.toFixed(2)}</span>
                                                </StatItem>
                                            )}
                                        </StatsRow>
                                    </MetricCard>
                                );
                            })}
                        </MetricsList>
                    </MetricGroup>
                ))}

                {/* 2. GRÁFICOS (Cambian según viewMode) */}
                {report.chartData && Object.entries(report.chartData).map(([category, chartMetrics]) => (
                    <MetricGroup key={`chart-${category}`}>
                        <GroupTitle>
                            {viewMode === 'real' ? `Historial - ${category}` : `Proyección Futura - ${category}`}
                        </GroupTitle>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr' }}>
                            {chartMetrics.map((chartMetric) => {
                                // Filtramos datos según el modo
                                const dataToRender = viewMode === 'real' 
                                    ? chartMetric.data.filter(p => !p.isFuture) // Solo pasado
                                    : chartMetric.data; // Pasado + Futuro
                                
                                const dataWithTrend = addTrendLine(dataToRender);

                                return (
                                    <ChartWrapper key={chartMetric.metric}>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#475569', fontSize: 14 }}>{chartMetric.metric}</h4>
                                        <ChartContainer>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={dataWithTrend}>
                                                    <defs>
                                                        <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis
                                                        dataKey="timestamp"
                                                        tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                                        axisLine={false} tickLine={false} minTickGap={30}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                                        axisLine={false} tickLine={false} width={40}
                                                        domain={['auto', 'auto']} // Auto-scale se ajusta perfecto a los datos filtrados
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        labelFormatter={(val) => new Date(val).toLocaleString()}
                                                    />
                                                    <Legend />
                                                    
                                                    {/* Solo mostramos área de confianza en modo IA */}
                                                    {viewMode === 'ai' && (
                                                        <Area type="monotone" dataKey="confidenceHigh" stroke="none" fill="url(#confidenceGradient)" name="Incertidumbre IA" />
                                                    )}
                                                    
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        name={viewMode === 'real' ? "Valor Real" : "Proyección"}
                                                        stroke={viewMode === 'real' ? "#2563eb" : "#7c3aed"} // Azul vs Violeta
                                                        strokeWidth={2}
                                                        dot={false}
                                                        activeDot={{ r: 6 }}
                                                        strokeDasharray={viewMode === 'ai' ? "3 3" : ""} // Punteada si es IA (opcional)
                                                    />
                                                    
                                                    {/* Tendencia lineal simple siempre útil como referencia */}
                                                    <Line 
                                                        type="linear" 
                                                        dataKey="trend" 
                                                        name="Tendencia Lineal" 
                                                        stroke="#f97316" 
                                                        strokeWidth={2} 
                                                        strokeDasharray="5 5" 
                                                        dot={false} 
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
    );
}