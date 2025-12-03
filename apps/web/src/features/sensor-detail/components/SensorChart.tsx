import { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import {
    CategorySection,
    CategoryTitle,
    ChartGrid,
    ChartCard,
    MetricHeader,
    StatusBadge,
    ChartFooter
} from "../styled";

interface SensorChartsProps {
    chartData: Record<string, any[]>;
    latest: any;
}

// Colores por defecto si el estado es OK
const DEFAULT_COLORS = [
    { stroke: "#3b82f6", fill: "#3b82f6" }, // Blue
    { stroke: "#10b981", fill: "#10b981" }, // Emerald
    { stroke: "#8b5cf6", fill: "#8b5cf6" }, // Violet
    { stroke: "#06b6d4", fill: "#06b6d4" }, // Cyan
];

// Colores de estado (Alerta)
const STATUS_COLORS = {
    critical: { stroke: "#dc2626", fill: "#dc2626" }, // Red
    warning:  { stroke: "#d97706", fill: "#d97706" }, // Amber
    ok:       { stroke: "#10b981", fill: "#10b981" }, // Green (opcional, o usar default)
};

/**
 * Calcula el rango del eje Y asegurando que los límites sean visibles
 */
function computeSmartDomain(data: any[], dataKey: string, minLimit?: number, maxLimit?: number) {
    if (!data.length) return [0, 100];

    let minData = Infinity;
    let maxData = -Infinity;

    data.forEach(d => {
        const val = Number(d[dataKey]);
        if (!isNaN(val)) {
            if (val < minData) minData = val;
            if (val > maxData) maxData = val;
        }
    });

    if (!isFinite(minData)) minData = 0;
    if (!isFinite(maxData)) maxData = 100;

    // Expandimos el dominio para incluir los límites si existen
    let lowerBound = minLimit !== undefined ? Math.min(minData, minLimit) : minData;
    let upperBound = maxLimit !== undefined ? Math.max(maxData, maxLimit) : maxData;

    // Agregamos padding visual (15%)
    const range = upperBound - lowerBound || 10;
    return [
        Math.floor(lowerBound - range * 0.15), 
        Math.ceil(upperBound + range * 0.15)
    ];
}

interface SingleChartProps {
    title: string;
    dataKey: string;
    data: any[];
    colorIndex: number;
    latestValue: any;
    status: "ok" | "warning" | "critical";
    limits?: { min?: number; max?: number };
}

const SingleMetricChart = ({ title, dataKey, data, colorIndex, latestValue, status, limits }: SingleChartProps) => {
    // Seleccionamos color: Si es warning/critical usamos color de estado, sino el rotativo
    let color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
    
    if (status === "critical") color = STATUS_COLORS.critical;
    else if (status === "warning") color = STATUS_COLORS.warning;

    const domain = useMemo(
        () => computeSmartDomain(data, dataKey, limits?.min, limits?.max), 
        [data, dataKey, limits]
    );

    const formattedValue = typeof latestValue === 'number' 
        ? latestValue.toFixed(2) 
        : latestValue ?? "--";

    return (
        <ChartCard $status={status}>
            <MetricHeader>
                <div className="title-group">
                    <h3>{title}</h3>
                    <StatusBadge $status={status}>
                        {status === 'ok' ? 'Normal' : status === 'warning' ? 'Precaución' : 'Crítico'}
                    </StatusBadge>
                </div>
                <div className="current-value">
                    {formattedValue}
                    <span style={{fontSize: 12, color: '#94a3b8', marginLeft: 4, fontWeight: 500}}>actual</span>
                </div>
            </MetricHeader>

            <div style={{ height: 220, width: "100%" }}>
                <ResponsiveContainer>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color-${dataKey}-${status}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color.fill} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color.fill} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        
                        <XAxis dataKey="time" hide />
                        
                        <YAxis 
                            domain={domain} 
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                        />
                        
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--bg-card, #ffffff)",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color, #e2e8f0)",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--text-primary, #0f172a)"
                            }}
                            itemStyle={{ color: "var(--text-primary, #0f172a)" }}
                            formatter={(val: number) => [val.toFixed(2), title]}
                            labelStyle={{ color: "#64748b", marginBottom: 4 }}
                        />

                        {/* --- LÍNEAS DE LÍMITE --- */}
                        {limits?.max !== undefined && (
                            <ReferenceLine 
                                y={limits.max} 
                                stroke="#ef4444" 
                                strokeDasharray="3 3" 
                                label={{ 
                                    position: 'right', 
                                    value: `Max: ${limits.max}`, 
                                    fill: '#ef4444', 
                                    fontSize: 10 
                                }} 
                            />
                        )}
                        {limits?.min !== undefined && (
                            <ReferenceLine 
                                y={limits.min} 
                                stroke="#3b82f6" 
                                strokeDasharray="3 3" 
                                label={{ 
                                    position: 'right', 
                                    value: `Min: ${limits.min}`, 
                                    fill: '#3b82f6', 
                                    fontSize: 10 
                                }} 
                            />
                        )}

                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color.stroke}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#color-${dataKey}-${status})`}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            {/* Pie de tarjeta con información de límites si existen */}
            {(limits?.max !== undefined || limits?.min !== undefined) && (
                 <ChartFooter>
                    {limits.max !== undefined && <span>Limite Alto: <strong>{limits.max}</strong></span>}
                    {limits.min !== undefined && <span>Limite Bajo: <strong>{limits.min}</strong></span>}
                 </ChartFooter>
            )}
        </ChartCard>
    );
};

export function SensorCharts({ chartData, latest }: SensorChartsProps) {
    const categories = Object.keys(chartData);

    if (categories.length === 0) {
        return <div style={{ padding: 20, color: "#94a3b8", textAlign: 'center' }}>Esperando datos del sensor...</div>;
    }

    let globalColorIndex = 0;

    return (
        <>
            {categories.map((category) => {
                const data = chartData[category];
                if (!data.length) return null;

                // Filtramos 'time' para obtener solo las métricas
                const metrics = Object.keys(data[0]).filter((k) => k !== "time");

                return (
                    <CategorySection key={category}>
                        <CategoryTitle>{category.toUpperCase()}</CategoryTitle>
                        
                        <ChartGrid>
                            {metrics.map((metric) => {
                                const currentIndex = globalColorIndex++;
                                
                                // Lógica para extraer valor, estado y límites del objeto 'latest'
                                let latestVal = 0;
                                let status: "ok" | "warning" | "critical" = "ok";
                                let limits = {}; 

                                try {
                                    const metricObj = latest?.metrics?.[category]?.[metric];
                                    
                                    // Verificamos si metricObj es un objeto complejo { value, status, limits }
                                    // o si es un valor simple.
                                    if (typeof metricObj === 'object' && metricObj !== null) {
                                        latestVal = metricObj.value;
                                        status = metricObj.status || "ok";
                                        // Asumimos que los límites vienen en el objeto, si no, intentamos inferirlos o dejarlos vacíos
                                        // Ajusta esto según cómo venga tu backend realmente
                                        limits = metricObj.limits || {}; 
                                    } else {
                                        latestVal = metricObj;
                                        // Si viene plano, intentamos sacar el estado del padre
                                        status = latest?.status || "ok";
                                    }
                                } catch (e) {
                                    console.warn("Error parsing metric", e);
                                }

                                return (
                                    <SingleMetricChart
                                        key={metric}
                                        title={metric}
                                        dataKey={metric}
                                        data={data}
                                        colorIndex={currentIndex}
                                        latestValue={latestVal}
                                        status={status}
                                        limits={limits}
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