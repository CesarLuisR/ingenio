// src/modules/dashboard/Dashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { api } from "../../lib/api";
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardStatus } from "./hooks/useDashboardStatus";
import type { BaseMetrics } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { ROLES } from "../../types";
import SuperAdminDashboard from "./SuperAdminDashboard";

// Componentes Hijos Nuevos
import HistoryChart from "./components/HistoryChart";
import ActivityFeed from "./components/ActivityFeed";

import {
    Container, Header, HeaderActions, Title, Subtitle,
    MetricsGrid, MetricCard, MetricLabel, MetricValue, MetricUnit,
    HealthBadge, ConnectionBadge, Loader, ErrorBox,
    DashboardGrid, ChartContainer, SectionTitle,
} from "./styled";

// --- HELPERS ---
const formatPercent = (v: number | undefined | null) => v == null ? "—" : `${Number(v).toFixed(1)}%`;
const formatHours = (v: number | undefined | null) => {
    if (v == null) return "—";
    const val = Number(v);
    if (val >= 24) return `${(val / 24).toFixed(1)}d`;
    return `${val.toFixed(1)}h`;
};
const getHealth = (av: number | undefined) => {
    if (av == null) return "neutral";
    if (av > 97) return "ok";
    if (av > 92) return "warning";
    return "critical";
};
const PIE_COLORS = ['#16a34a', '#eab308', '#dc2626', '#94a3b8'];

export default function Dashboard() {
    const { user } = useSessionStore();

    if (user?.role === ROLES.SUPERADMIN) return <SuperAdminDashboard />;

    // 1. Hooks
    const { sensors, loading: sensorsLoading } = useDashboardData();
    const wsStatus = useDashboardStatus();
    
    // 2. Estados Locales
    const [metrics, setMetrics] = useState<BaseMetrics | null>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 3. Carga de Datos Inicial
    useEffect(() => {
        if (!user?.ingenioId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Cargamos todo en paralelo para velocidad
                const [m, h, a] = await Promise.all([
                    api.getIngenioMetrics(user.ingenioId!),
                    api.getDashboardHistory(user.ingenioId!),
                    api.getRecentActivity(user.ingenioId!)
                ]);
                setMetrics(m);
                setHistoryData(h);
                setActivityData(a);
            } catch (err) {
                console.error(err);
                setError("Error cargando datos del dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Opcional: Recargar actividad cada minuto
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [user?.ingenioId]);

    // 4. Datos Derivados (Sensores en tiempo real)
    // todo: Verificar si es necesario el !
    const health = getHealth(metrics?.availability!);
    const isGlobalLoading = loading || sensorsLoading;

    const sensorStats = useMemo(() => {
        if (!sensors.length) return [];
        let ok = 0, warning = 0, critical = 0, inactive = 0;
        sensors.forEach(s => {
            if (!s.active) { inactive++; return; }
            const sev = Number((s as any).severity || 0);
            if (sev >= 3) critical++;
            else if (sev === 2) warning++;
            else ok++;
        });
        return [
            { name: 'Operativos', value: ok },
            { name: 'Alerta', value: warning },
            { name: 'Críticos', value: critical },
            { name: 'Inactivos', value: inactive },
        ].filter(i => i.value > 0);
    }, [sensors]);

    return (
        <Container>
            <Header>
                <div>
                    <Title>Dashboard General</Title>
                    <Subtitle>Estado en tiempo real del Ingenio</Subtitle>
                </div>
                <HeaderActions>
                    <ConnectionBadge status={wsStatus}>
                        {wsStatus === 'connected' ? '● En Vivo' : '○ Offline'}
                    </ConnectionBadge>
                    <HealthBadge status={health}>
                        {health === "ok" ? "Salud Óptima" : 
                         health === "warning" ? "Revisión Necesaria" : 
                         health === "critical" ? "Estado Crítico" : "-"}
                    </HealthBadge>
                </HeaderActions>
            </Header>

            {isGlobalLoading && !metrics ? <Loader>Cargando sistema...</Loader> : (
                <>
                    {error && <ErrorBox>{error}</ErrorBox>}
                    
                    {/* KPI CARDS */}
                    <MetricsGrid>
                        <MetricCard>
                            <MetricLabel>Disponibilidad (24h)</MetricLabel>
                            <MetricValue>{formatPercent(metrics?.availability)}</MetricValue>
                            <MetricUnit>Tiempo operativo</MetricUnit>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>Confiabilidad</MetricLabel>
                            <MetricValue>{formatPercent(metrics?.reliability)}</MetricValue>
                            <MetricUnit>Tasa de éxito</MetricUnit>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>MTBF</MetricLabel>
                            <MetricValue>{formatHours(metrics?.mtbf)}</MetricValue>
                            <MetricUnit>Horas entre fallas</MetricUnit>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>MTTR</MetricLabel>
                            <MetricValue style={{color: (metrics?.mttr || 0) > 24 ? '#dc2626' : 'inherit'}}>
                                {formatHours(metrics?.mttr)}
                            </MetricValue>
                            <MetricUnit>Horas para reparar</MetricUnit>
                        </MetricCard>
                    </MetricsGrid>

                    {/* GRID PRINCIPAL */}
                    <DashboardGrid>
                        {/* 1. Gráfico de Área (Historial) */}
                        <ChartContainer>
                            <SectionTitle style={{marginTop:0}}>Tendencia de Disponibilidad (24h)</SectionTitle>
                            <HistoryChart data={historyData} />
                        </ChartContainer>

                        {/* 2. Gráfico de Pastel (Estado Sensores) */}
                        <ChartContainer>
                            <SectionTitle style={{marginTop:0}}>Estado de Sensores</SectionTitle>
                            {sensorStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={sensorStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {sensorStats.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div style={{height:280, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>Sin sensores</div>}
                        </ChartContainer>

                        {/* 3. Feed de Actividad (Fallas + Mantenimientos) */}
                        <ChartContainer style={{ gridColumn: '1 / -1' }}> 
                            {/* Nota: Hacemos que ocupe todo el ancho abajo */}
                            <SectionTitle style={{marginTop:0}}>Actividad Reciente (Fallas y Mantenimientos)</SectionTitle>
                            <ActivityFeed data={activityData} />
                        </ChartContainer>
                    </DashboardGrid>
                </>
            )}
        </Container>
    );
}