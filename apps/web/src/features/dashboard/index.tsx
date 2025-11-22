import { useEffect, useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { api } from "../../lib/api";
import {
    Container,
    Header,
    HeaderActions,
    Title,
    Subtitle,
    MetricsGrid,
    MetricCard,
    MetricLabel,
    MetricValue,
    MetricUnit,
    HealthBadge,
    ConnectionBadge,
    Loader,
    ErrorBox,
    DashboardGrid,
    ChartContainer,
    SectionTitle,
} from "./styled";
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardStatus } from "./hooks/useDashboardStatus";
import type { BaseMetrics } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { ROLES } from "../../types";
import SuperAdminDashboard from "./SuperAdminDashboard";

const INGENIO_ID = 1;

// --- HELPER FUNCTIONS ---
const formatPercent = (v: number | null) => v == null ? "—" : `${v.toFixed(2)}%`;
const formatHours = (value: number | null) => {
    if (value == null) return "—";
    if (value >= 24) return `${(value / 24).toFixed(1)}d`;
    return `${value.toFixed(1)}h`;
};

const getHealth = (availability: number | null, reliability: number | null) => {
    if (availability == null || reliability == null) return "neutral";
    if (availability > 97 && reliability > 97) return "ok";
    if (availability > 93 && reliability > 93) return "warning";
    return "critical";
};

// --- MOCK DATA FOR CHARTS (Replace with API history endpoint later) ---
const MOCK_HISTORY_DATA = [
    { time: '08:00', availability: 94 },
    { time: '10:00', availability: 96 },
    { time: '12:00', availability: 92 },
    { time: '14:00', availability: 98 },
    { time: '16:00', availability: 97 },
    { time: '18:00', availability: 99 },
];
const PIE_COLORS = ['#16a34a', '#dc2626', '#94a3b8']; // OK, Critical, Offline

export default function Dashboard() {
    const { user } = useSessionStore();

    if (user?.role === ROLES.SUPERADMIN) {
        return <SuperAdminDashboard />;
    }

    // 1. Data Hooks
    const { sensors, loading: sensorsLoading } = useDashboardData();
    const wsStatus = useDashboardStatus();
    
    // 2. Local State for Metrics
    const [metrics, setMetrics] = useState<BaseMetrics | null>(null);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 3. Fetch Global Metrics
    useEffect(() => {
        (async () => {
            try {
                setMetricsLoading(true);
                const m = await api.getIngenioMetrics(INGENIO_ID);
                setMetrics(m);
            } catch (err) {
                setError("Error al cargar métricas del ingenio.");
            } finally {
                setMetricsLoading(false);
            }
        })();
    }, []);

    // 4. Compute Derived Data
    const health = getHealth(metrics?.availability ?? null, metrics?.reliability ?? null);
    const loading = metricsLoading || sensorsLoading;

    const sensorStats = useMemo(() => {
        const active = sensors.filter(s => s.active && s.lastStatus === 'ok').length;
        const critical = sensors.filter(s => s.active && s.lastStatus !== 'ok').length;
        const offline = sensors.filter(s => !s.active).length;
        
        return [
            { name: 'Operativos', value: active },
            { name: 'Críticos', value: critical },
            { name: 'Offline', value: offline },
        ];
    }, [sensors]);

    return (
        <Container>
            <Header>
                <div>
                    <Title>Dashboard General</Title>
                    <Subtitle>Vista general del estado del ingenio</Subtitle>
                </div>
                <HeaderActions>
                    <ConnectionBadge status={wsStatus}>
                        {wsStatus === 'connected' ? 'Conectado en tiempo real' : 
                         wsStatus === 'connecting' ? 'Reconectando...' : 'Desconectado'}
                    </ConnectionBadge>
                    <HealthBadge status={health}>
                        {health === "ok" ? "Salud Óptima" : 
                         health === "warning" ? "Requiere Atención" : 
                         health === "critical" ? "Estado Crítico" : "Calculando..."}
                    </HealthBadge>
                </HeaderActions>
            </Header>

            {loading && <Loader>Cargando datos del sistema...</Loader>}
            {error && <ErrorBox>{error}</ErrorBox>}

            {!loading && !error && metrics && (
                <>
                    {/* --- KPI METRICS ROW --- */}
                    <MetricsGrid>
                        <MetricCard>
                            <MetricLabel>Disponibilidad Global</MetricLabel>
                            <MetricValue>{formatPercent(metrics.availability)}</MetricValue>
                            <MetricUnit>Target: 98.0%</MetricUnit>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>Confiabilidad</MetricLabel>
                            <MetricValue>{formatPercent(metrics.reliability)}</MetricValue>
                            <MetricUnit>MTBF / (MTBF + MTTR)</MetricUnit>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>MTBF</MetricLabel>
                            <MetricValue>{formatHours(metrics.mtbf)}</MetricValue>
                            <MetricUnit>Tiempo medio entre fallas</MetricUnit>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>MTTR</MetricLabel>
                            <MetricValue style={{color: (metrics.mttr || 0) > 5 ? '#dc2626' : '#0f172a'}}>
                                {formatHours(metrics.mttr)}
                            </MetricValue>
                            <MetricUnit>Tiempo medio reparación</MetricUnit>
                        </MetricCard>
                    </MetricsGrid>

                    {/* --- CHARTS ROW --- */}
                    <DashboardGrid>
                        <ChartContainer>
                            <SectionTitle style={{marginTop: 0}}>Tendencia de Disponibilidad (24h)</SectionTitle>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={MOCK_HISTORY_DATA}>
                                    <defs>
                                        <linearGradient id="colorAv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                    />
                                    <Area type="monotone" dataKey="availability" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAv)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>

                        <ChartContainer>
                            <SectionTitle style={{marginTop: 0}}>Estado de Sensores</SectionTitle>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={sensorStats}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sensorStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </DashboardGrid>
                </>
            )}
        </Container>
    );
}