import { useState } from "react";
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
    ReportCard, ReportHeader, CollapseButton, CollapseContent,
    ReportBody, MetricGroup, GroupTitle, MetricsList, MetricCard,
    MetricHeader, MetricName, UrgencyBadge, AnalysisText,
    StatsRow, StatItem, ChartWrapper, ChartContainer
} from "../styled";
import type { SensorReport } from "../../../types";

// Helpers -----------------------------------

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
        const x = i;
        const y = point.value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((p, i) => ({
        ...p,
        trend: slope * i + intercept
    }));
};

// Component ---------------------------------

export default function SensorAnalysisCard({ report }: { report: SensorReport }) {
    const [collapsed, setCollapsed] = useState(true);
    const [viewMode, setViewMode] = useState<"real" | "ai">("real");

    return (
        <ReportCard>

            {/* HEADER DEL SENSOR */}
            <ReportHeader onClick={() => setCollapsed(!collapsed)}>
                <h2>📡 Sensor: {report.sensorId}</h2>

                <CollapseButton $open={!collapsed}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </CollapseButton>
            </ReportHeader>

            {/* CONTENIDO EXPANDIBLE */}
            {!collapsed && (
                <CollapseContent>

                    {/* SWITCH REAL / IA */}
                    <div style={{
                        display: "flex",
                        gap: 6,
                        background: "#f1f5f9",
                        padding: 4,
                        borderRadius: 8,
                        marginBottom: 20
                    }}>
                        <button
                            onClick={() => setViewMode("real")}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                background: viewMode === "real" ? "white" : "transparent",
                                color: viewMode === "real" ? "#2563eb" : "#64748b",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Histórico Real
                        </button>

                        <button
                            onClick={() => setViewMode("ai")}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                background: viewMode === "ai" ? "white" : "transparent",
                                color: viewMode === "ai" ? "#7c3aed" : "#64748b",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Predicción IA
                        </button>
                    </div>

                    {/* CUERPO */}
                    <ReportBody>

                        {/* MÉTRICAS */}
                        {Object.entries(report.resumen).map(([category, metrics]) => (
                            <MetricGroup key={category}>
                                <GroupTitle>{category.toUpperCase()}</GroupTitle>

                                <MetricsList>
                                    {Object.entries(metrics).map(([metricName, analysis]: any) => {
                                        if (!analysis) return null;

                                        return (
                                            <MetricCard key={metricName} $urgency={analysis.urgencia}>
                                                <MetricHeader>
                                                    <MetricName>{metricName}</MetricName>
                                                    <UrgencyBadge $urgency={analysis.urgencia}>{analysis.urgencia}</UrgencyBadge>
                                                </MetricHeader>

                                                <AnalysisText>{analysis.message || analysis.recommendation}</AnalysisText>

                                                <StatsRow>

                                                    {analysis.rulHours != null && (
                                                        <StatItem>
                                                            <span>RUL</span>
                                                            <span style={{ color: "#ef4444" }}>{analysis.rulHours}h</span>
                                                        </StatItem>
                                                    )}

                                                    <StatItem>
                                                        <span>Actual</span>
                                                        <span>{analysis.currentValue?.toFixed(2) ?? "-"}</span>
                                                    </StatItem>

                                                    <StatItem>
                                                        <span>Tendencia</span>
                                                        <span>
                                                            {getTrendIcon(analysis.trend)} {analysis.trend}
                                                        </span>
                                                    </StatItem>

                                                    {viewMode === "ai" && (
                                                        <StatItem>
                                                            <span>Futuro 24h</span>
                                                            <span style={{ color: "#7c3aed" }}>
                                                                {analysis.predictedValue24h?.toFixed(2)}
                                                            </span>
                                                        </StatItem>
                                                    )}

                                                </StatsRow>

                                            </MetricCard>
                                        );
                                    })}
                                </MetricsList>
                            </MetricGroup>
                        ))}

                        {/* GRÁFICOS */}
                        {report.chartData &&
                            Object.entries(report.chartData).map(([category, chartMetrics]) => (
                                <MetricGroup key={category}>
                                    <GroupTitle>
                                        {viewMode === "real" ? "Historial - " : "Proyección - "}
                                        {category}
                                    </GroupTitle>

                                    <div style={{ display: "grid", gap: 20 }}>
                                        {chartMetrics.map((chart) => {
                                            const data = viewMode === "real"
                                                ? chart.data.filter((p: any) => !p.isFuture)
                                                : chart.data;

                                            const dataWithTrend = addTrendLine(data);

                                            return (
                                                <ChartWrapper key={chart.metric}>
                                                    <h4 style={{ margin: 0, marginBottom: 10 }}>{chart.metric}</h4>

                                                    <ChartContainer>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <ComposedChart data={dataWithTrend}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                                <XAxis
                                                                    dataKey="timestamp"
                                                                    tickFormatter={(v) =>
                                                                        new Date(v).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit"
                                                                        })
                                                                    }
                                                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />
                                                                <YAxis
                                                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />

                                                                <Tooltip />
                                                                <Legend />

                                                                {viewMode === "ai" && (
                                                                    <Area
                                                                        type="monotone"
                                                                        dataKey="confidenceHigh"
                                                                        fill="rgba(124, 58, 237, 0.15)"
                                                                    />
                                                                )}

                                                                <Line
                                                                    dataKey="value"
                                                                    stroke={viewMode === "real" ? "#2563eb" : "#7c3aed"}
                                                                    strokeWidth={2}
                                                                    dot={false}
                                                                    name={viewMode === "real" ? "Valor Real" : "Proyección IA"}
                                                                />

                                                                <Line
                                                                    dataKey="trend"
                                                                    stroke="#f97316"
                                                                    strokeDasharray="4 4"
                                                                    strokeWidth={2}
                                                                    dot={false}
                                                                    name="Tendencia"
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
                </CollapseContent>
            )}
        </ReportCard>
    );
}
