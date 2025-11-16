import React, { useMemo, useEffect, useState, useRef } from "react";
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
import { Card, ChartHeader, MetricStatus, Status } from "../styled";

interface SensorChartsProps {
	chartData: Record<string, any[]>;
	latest: any;
}

const COLORS = [
	"#2563eb",
	"#dc2626",
	"#16a34a",
	"#f59e0b",
	"#8b5cf6",
	"#ec4899",
	"#0ea5e9",
	"#14b8a6",
];

function getStatusLabel(status?: string) {
	if (!status) return "unknown";
	if (status === "ok") return "✅ OK";
	if (status === "warning") return "⚠️ Warning";
	if (status === "critical") return "🚨 Critical";
	return "–";
}

interface CategoryChartProps {
	category: string;
	data: any[];
	latest: any;
}

function CategoryChart({ category, data, latest }: CategoryChartProps) {
	const [displayData, setDisplayData] = useState<any[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const previousDataRef = useRef<any[]>([]);

	// Obtener métricas de forma estable
	const metrics = useMemo(() => {
		if (!latest?.metrics?.[category]) return [];
		return Object.keys(latest.metrics[category]);
	}, [latest?.metrics, category]);

	// Normalizar los datos: extraer valores numéricos y agregar índice único
	const normalizedData = useMemo(() => {
		return data.map((point, index) => {
			const normalized: any = { 
				time: point.time,
				index: index,
				displayTime: point.time
			};
			
			metrics.forEach((metric) => {
				const rawValue = point[metric];
				if (typeof rawValue === "number") {
					normalized[metric] = rawValue;
				} else if (rawValue && typeof rawValue === "object" && typeof rawValue.value === "number") {
					normalized[metric] = rawValue.value;
				}
			});
			
			return normalized;
		});
	}, [data, metrics]);

	// Detectar cuando llegan nuevos datos y animar en dos pasos
	useEffect(() => {
		const currentLength = normalizedData.length;
		const previousLength = previousDataRef.current.length;
		
		if (currentLength > previousLength && previousLength > 0) {
			// Nuevo dato detectado
			setIsAnimating(true);
			
			// PASO 1: Mostrar solo los N-1 puntos anteriores (sin el último)
			// Esto simula el desplazamiento a la izquierda
			const dataWithoutLast = normalizedData.slice(0, -1);
			setDisplayData(dataWithoutLast);
			
			// PASO 2: Después de 400ms, mostrar todos los datos incluyendo el nuevo punto
			setTimeout(() => {
				setDisplayData(normalizedData);
				
				// PASO 3: Después de otros 300ms, terminar la animación
				setTimeout(() => {
					setIsAnimating(false);
				}, 300);
			}, 400);
		} else {
			// Primera carga o mismo número de puntos
			setDisplayData(normalizedData);
			setIsAnimating(false);
		}
		
		previousDataRef.current = normalizedData;
	}, [normalizedData]);

	// Formatear el label del eje X para mostrar solo la parte relevante
	const formatXAxis = (value: any, index: number) => {
		const point = displayData[index];
		if (!point?.displayTime) return '';
		
		// Si es un timestamp ISO, extraer solo hora:minuto:segundo
		const timeStr = String(point.displayTime);
		if (timeStr.includes('T')) {
			const time = timeStr.split('T')[1];
			return time ? time.substring(0, 8) : timeStr;
		}
		// Si es solo hora, mostrarla directamente
		return timeStr;
	};

	if (metrics.length === 0 || !data || data.length === 0) {
		return (
			<Card>
				<ChartHeader>
					<h2>{category.toUpperCase()}</h2>
				</ChartHeader>
				<p style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
					No hay datos disponibles para esta categoría.
				</p>
			</Card>
		);
	}

	return (
		<Card>
			<ChartHeader>
				<h2>{category.toUpperCase()}</h2>
				<span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>
					{data.length} lecturas
				</span>
			</ChartHeader>
			
			<ResponsiveContainer width="100%" height={320}>
				<LineChart 
					data={displayData}
					margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
					<XAxis
						dataKey="index"
						type="number"
						domain={[0, Math.max(displayData.length - 1, 0)]}
						ticks={displayData.map((_, i) => i)}
						tickFormatter={formatXAxis}
						tick={{ fontSize: 10 }}
						angle={-45}
						textAnchor="end"
						height={70}
						interval={0}
						allowDataOverflow={false}
					/>
					<YAxis 
						tick={{ fontSize: 11 }}
						width={60}
						domain={['auto', 'auto']}
					/>
					<Tooltip 
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.98)",
							border: "1px solid #e2e8f0",
							borderRadius: "6px",
							fontSize: "12px",
							boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
						}}
						labelFormatter={(value) => {
							const point = displayData[value];
							return `Tiempo: ${point?.displayTime || value}`;
						}}
					/>
					<Legend 
						wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
						iconType="line"
					/>
					{metrics.map((metric, i) => (
						<Line
							key={metric}
							type="monotone"
							dataKey={metric}
							stroke={COLORS[i % COLORS.length]}
							strokeWidth={2.5}
							dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
							activeDot={{ r: 6 }}
							animationDuration={isAnimating ? 500 : 0}
							animationEasing="ease-in-out"
							connectNulls={true}
							isAnimationActive={true}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>

			<MetricStatus>
				{metrics.map((metric, i) => {
					const val = latest?.metrics?.[category]?.[metric];
					const status =
						typeof val === "object" && val !== null && "status" in val
							? val.status
							: latest?.status || "ok";

					return (
						<Status
							key={`${category}-${metric}`}
							status={status}
							style={{ border: `2px solid ${COLORS[i % COLORS.length]}` }}>
							{metric}: {getStatusLabel(status)}
						</Status>
					);
				})}
			</MetricStatus>
		</Card>
	);
}

export function SensorCharts({ chartData, latest }: SensorChartsProps) {
	if (!chartData || Object.keys(chartData).length === 0) {
		return <p>Sin lecturas todavía.</p>;
	}

	return (
		<>
			{Object.entries(chartData).map(([category, data]) => (
				<CategoryChart
					key={category}
					category={category}
					data={data}
					latest={latest}
				/>
			))}
		</>
	);
}