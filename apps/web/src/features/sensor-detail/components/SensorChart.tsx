import React, { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    CategorySection,
    CategoryTitle,
    ChartGrid,
    ChartCard,
    MetricHeader,
} from "../styled";

interface SensorChartsProps {
    chartData: Record<string, any[]>;
    latest: any;
}

// Paleta de colores moderna para rotar entre gráficas
const COLORS = [
    { stroke: "#3b82f6", fill: "#3b82f6" }, // Blue
    { stroke: "#10b981", fill: "#10b981" }, // Emerald
    { stroke: "#f59e0b", fill: "#f59e0b" }, // Amber
    { stroke: "#8b5cf6", fill: "#8b5cf6" }, // Violet
    { stroke: "#ec4899", fill: "#ec4899" }, // Pink
    { stroke: "#06b6d4", fill: "#06b6d4" }, // Cyan
];

// Función para mejorar el rango del eje Y
function computeDomain(data: any[], dataKey: string) {
    if (!data.length) return [0, 100];
    let min = Infinity;
    let max = -Infinity;
    
    data.forEach(d => {
        const val = Number(d[dataKey]);
        if (!isNaN(val)) {
            if (val < min) min = val;
            if (val > max) max = val;
        }
    });

    if (!isFinite(min) || !isFinite(max)) return [0, 100];
    
    const padding = (max - min) * 0.2; // 20% de padding
    if (padding === 0) return [min - 10, max + 10];

    return [Math.floor(min - padding), Math.ceil(max + padding)];
}

/**
 * Componente para una sola métrica (Ej: Temperatura)
 */
const SingleMetricChart = ({ title, dataKey, data, colorIndex, latestValue }: any) => {
    const color = COLORS[colorIndex % COLORS.length];
    const domain = useMemo(() => computeDomain(data, dataKey), [data, dataKey]);

    return (
        <ChartCard>
            <MetricHeader>
                <h3>{title}</h3>
                <div className="current-value">
                    {latestValue !== undefined && !isNaN(Number(latestValue))
                        ? Number(latestValue).toFixed(2)
                        : "--"}
                </div>
            </MetricHeader>

            <div style={{ height: 200, width: "100%" }}>
                <ResponsiveContainer>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color.fill} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color.fill} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="time" 
                            hide 
                        />
                        <YAxis 
                            domain={domain} 
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                fontSize: "12px",
                                fontWeight: 600,
                            }}
                            itemStyle={{ color: "#1e293b" }}
                            cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color.stroke}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color-${dataKey})`}
                            isAnimationActive={false} // Mejor rendimiento en tiempo real
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
};

/**
 * Componente Principal de Gráficos
 */
export function SensorCharts({ chartData, latest }: SensorChartsProps) {
    const categories = Object.keys(chartData);

    if (categories.length === 0) {
        return <div style={{ padding: 20, color: "#94a3b8" }}>Esperando datos del sensor...</div>;
    }

    let globalColorIndex = 0;

    return (
        <>
            {categories.map((category) => {
                const data = chartData[category];
                if (!data.length) return null;

                // Obtener las métricas disponibles en esta categoría (keys que no sean 'time')
                const samplePoint = data[0];
                const metrics = Object.keys(samplePoint).filter((k) => k !== "time");

                return (
                    <CategorySection key={category}>
                        <CategoryTitle>{category.toUpperCase()}</CategoryTitle>
                        
                        <ChartGrid>
                            {metrics.map((metric) => {
                                const currentIndex = globalColorIndex++;
                                
                                // Extraer el valor más reciente para mostrarlo en el header
                                let latestVal = 0;
                                try {
                                    const metricObj = latest?.metrics?.[category]?.[metric];
                                    latestVal = typeof metricObj === 'object' ? metricObj.value : metricObj;
                                } catch (e) {}

                                return (
                                    <SingleMetricChart
                                        key={metric}
                                        title={metric}
                                        dataKey={metric}
                                        data={data}
                                        colorIndex={currentIndex}
                                        latestValue={latestVal}
                                    />
                                );
                            })}
                        </ChartGrid>
                    </CategorySection>
                );
            })}
        </>
    );
}