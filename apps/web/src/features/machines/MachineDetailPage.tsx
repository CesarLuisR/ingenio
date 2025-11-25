import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importamos useNavigate
import { useMachineDetail } from "./hooks/useMachineDetail";
import {
    Container,
    ContentGrid,
    Header,
    HeaderTop,
    Title,
    SubInfo,
    TagRow,
    Tag,
    StatusTag,
    TabsRow,
    TabButton,
    Section,
    SectionTitle,
    Sidebar,
    SidebarCard,
    InfoList,
    MetricsGrid,
    MetricCard,
    MetricLabel,
    MetricValue,
    CardList,
    InfoCard,
    EmptyMessage,
} from "./detailStyled";

// --- HELPER ---
const formatMetric = (value: number | undefined | null, suffix: string = "") => {
    if (value === undefined || value === null) return "-";
    return `${Number(value).toFixed(2)}${suffix}`;
};

export default function MachineDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate(); // Hook para navegar
    const machineId = Number(id);

    const {
        machine,
        sensors,
        maintenances,
        failures,
        metrics,
        loading,
        error,
        reload,
    } = useMachineDetail(machineId);

    const [tab, setTab] = useState<"mantenimientos" | "fallas" | "sensores">("mantenimientos");

    /* LÓGICA DE NAVEGACIÓN AL REPORTE */
    const handleViewReport = () => {
        // Solo navegamos si hay datos guardados
        if (!machine || !machine.lastAnalysis) return;

        // Estructura compatible con MachineAnalysisResponse
        const preloadedResult = {
            machine: {
                id: machine.id,
                name: machine.name,
                code: machine.code
            },
            analysis: machine.lastAnalysis
        };

        // Navegamos a /analisis pasando el objeto en el state
        navigate("/analisis", { state: { preloadedResult } });
    };

    /* LÓGICA DE ESTADO VISUAL */
    const activeFailures = failures.filter(f => !f.resolvedAt);
    const hasWarnings = activeFailures.length > 0;

    let statusConfig = {
        text: "Fuera de Servicio",
        style: { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" }
    };

    if (machine?.active) {
        if (hasWarnings) {
            statusConfig = {
                text: "Advertencia",
                style: { background: "#fffbeb", color: "#d97706", borderColor: "#fcd34d" }
            };
        } else {
            statusConfig = {
                text: "Operativa",
                style: { background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }
            };
        }
    }

    /* LOADING & ERROR */
    if (loading) return <Container>Cargando información...</Container>;

    if (error) return (
        <Container>
            <div style={{ padding: 40, textAlign: "center", background: '#fee2e2', color: '#b91c1c', borderRadius: 12 }}>
                {error}
            </div>
        </Container>
    );

    if (!machine) return (
        <Container>
            <EmptyMessage>No se encontró la máquina solicitada.</EmptyMessage>
        </Container>
    );

    return (
        <Container>
            {/* HEADER */}
            <Header>
                <HeaderTop>
                    <div>
                        <Title>{machine.name}</Title>
                        <SubInfo>
                            <span>Código: {machine.code}</span>
                            {machine.location && <span>{machine.location}</span>}
                            <span>Reg: {new Date(machine.createdAt).toLocaleDateString()}</span>
                        </SubInfo>
                    </div>
                    
                    <StatusTag 
                        $active={machine.active} 
                        style={{
                            backgroundColor: statusConfig.style.background,
                            color: statusConfig.style.color,
                            border: `1px solid ${statusConfig.style.borderColor}`
                        }}
                    >
                        {statusConfig.text}
                    </StatusTag>
                </HeaderTop>

                <TagRow>
                    {machine.type && <Tag>{machine.type}</Tag>}
                    <Tag>{sensors.length} sensores</Tag>
                    <Tag>{maintenances.length} mantenimientos</Tag>
                    <Tag style={{ color: hasWarnings ? '#ef4444' : 'inherit', fontWeight: hasWarnings ? 700 : 400 }}>
                        {activeFailures.length} fallas activas ({failures.length} total)
                    </Tag>
                </TagRow>
            </Header>

            <ContentGrid>
                {/* COLUMNA IZQUIERDA: CONTENIDO */}
                <div>
                    <TabsRow>
                        <TabButton $active={tab === "mantenimientos"} onClick={() => setTab("mantenimientos")}>
                            Mantenimientos
                        </TabButton>
                        <TabButton $active={tab === "fallas"} onClick={() => setTab("fallas")}>
                            Historial de Fallas
                        </TabButton>
                        <TabButton $active={tab === "sensores"} onClick={() => setTab("sensores")}>
                            Sensores Instalados
                        </TabButton>
                    </TabsRow>

                    {/* TABS CONTENT */}
                    {tab === "mantenimientos" && (
                        <Section>
                            <SectionTitle>
                                Registro de intervenciones
                                <button 
                                    onClick={() => reload()} 
                                    style={{ marginLeft: 'auto', fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}
                                >
                                    ↻ Actualizar
                                </button>
                            </SectionTitle>
                            {maintenances.length === 0 ? (
                                <EmptyMessage>No hay mantenimientos registrados.</EmptyMessage>
                            ) : (
                                <CardList>
                                    {maintenances.map((mt) => (
                                        <InfoCard key={mt.id}>
                                            <div className="header">
                                                <span className="title">{mt.type}</span>
                                                <span className="date">{new Date(mt.performedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta">
                                                <span>Técnico: <strong>{mt.technician?.name ? mt.technician.name : "Sin asignar"}</strong></span>
                                                <span>Duración: <strong>{mt.durationMinutes ?? 0} min</strong></span>
                                            </div>
                                            {mt.notes && <div className="notes">{mt.notes}</div>}
                                        </InfoCard>
                                    ))}
                                </CardList>
                            )}
                        </Section>
                    )}

                    {tab === "fallas" && (
                        <Section>
                            <SectionTitle>Incidencias reportadas</SectionTitle>
                            {failures.length === 0 ? (
                                <EmptyMessage>Excelente, no hay fallas registradas.</EmptyMessage>
                            ) : (
                                <CardList>
                                    {failures.map((f) => (
                                        <InfoCard key={f.id} $error>
                                            <div className="header">
                                                <span className="title">{f.description}</span>
                                                <span className="date">{new Date(f.occurredAt).toLocaleString()}</span>
                                            </div>
                                            <div className="meta">
                                                <span>Severidad: <strong>{f.severity ?? "Media"}</strong></span>
                                                <span>Estado: <strong>{f.status ?? "Abierto"}</strong></span>
                                            </div>
                                            {f.resolvedAt ? (
                                                <div className="notes" style={{ background: '#f0fdf4', color: '#166534' }}>
                                                    ✅ Resuelto el {new Date(f.resolvedAt).toLocaleString()}
                                                </div>
                                            ) : (
                                                <div className="notes" style={{ background: '#fffbeb', color: '#b45309' }}>
                                                    ⚠️ Pendiente de resolución
                                                </div>
                                            )}
                                        </InfoCard>
                                    ))}
                                </CardList>
                            )}
                        </Section>
                    )}

                    {tab === "sensores" && (
                        <Section>
                            <SectionTitle>Monitoreo en tiempo real</SectionTitle>
                            {sensors.length === 0 ? (
                                <EmptyMessage>No hay sensores asignados a esta máquina.</EmptyMessage>
                            ) : (
                                <CardList>
                                    {sensors.map((s) => (
                                        <InfoCard key={s.id}>
                                            <div className="header">
                                                <span className="title">{s.name}</span>
                                                <span className="date" style={{ background: s.active ? '#ecfdf5' : '#f1f5f9', color: s.active ? '#059669' : '#64748b' }}>
                                                    {s.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="meta">
                                                <span>ID: {s.sensorId}</span>
                                                <span>Tipo: {s.type}</span>
                                            </div>
                                            <div style={{ fontSize: 12, marginTop: 8, color: '#94a3b8' }}>
                                                Última señal: {s.lastSeen ? new Date(s.lastSeen).toLocaleString() : "Nunca"}
                                            </div>
                                        </InfoCard>
                                    ))}
                                </CardList>
                            )}
                        </Section>
                    )}
                </div>

                {/* COLUMNA DERECHA: SIDEBAR */}
                <Sidebar>
                    {/* INFO GENERAL */}
                    <SidebarCard>
                        <SectionTitle style={{ marginBottom: 16 }}>Ficha Técnica</SectionTitle>
                        <InfoList>
                            <div><span>Nombre</span> <span>{machine.name}</span></div>
                            <div><span>Código</span> <span>{machine.code}</span></div>
                            <div><span>Tipo</span> <span>{machine.type ?? "-"}</span></div>
                            <div><span>Ubicación</span> <span>{machine.location ?? "-"}</span></div>
                            <div><span>Fecha de Registro</span> <span>{new Date(machine.createdAt).toLocaleString()}</span></div>
                            <div><span>Fecha de Actualización</span> <span>{new Date(machine.updatedAt).toLocaleString()}</span></div>
                            <div>
                                <span>Estado</span> 
                                <span style={{ color: statusConfig.style.color, fontWeight: 600 }}>
                                    {statusConfig.text}
                                </span>
                            </div>
                        </InfoList>
                        {machine.description && (
                            <div style={{ marginTop: 16, fontSize: 13, color: '#64748b', lineHeight: 1.5, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                                {machine.description}
                            </div>
                        )}
                    </SidebarCard>

                    {/* KPIs */}
                    <SidebarCard>
                        <SectionTitle style={{ marginBottom: 16 }}>KPIs de Rendimiento</SectionTitle>
                        {!metrics ? (
                            <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sin datos métricos</div>
                        ) : (
                            <MetricsGrid>
                                <MetricCard>
                                    <MetricLabel>Disponibilidad</MetricLabel>
                                    <MetricValue title={String(metrics.availability)}>
                                        {formatMetric(metrics.availability, "%")}
                                    </MetricValue>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>Confiabilidad</MetricLabel>
                                    <MetricValue title={String(metrics.reliability)}>
                                        {formatMetric(metrics.reliability, "%")}
                                    </MetricValue>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>MTBF</MetricLabel>
                                    <MetricValue title={String(metrics.mtbf)}>
                                        {formatMetric(metrics.mtbf, "h")}
                                    </MetricValue>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>MTTR</MetricLabel>
                                    <MetricValue title={String(metrics.mttr)}>
                                        {formatMetric(metrics.mttr, "h")}
                                    </MetricValue>
                                </MetricCard>
                            </MetricsGrid>
                        )}
                    </SidebarCard>

                    {/* ÚLTIMO REPORTE */}
                    <SidebarCard>
                        <SectionTitle style={{ marginBottom: 12 }}>Último Reporte</SectionTitle>
                        
                        {/* Mostramos la fecha del último análisis si existe */}
                        {machine.lastAnalyzedAt && (
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textAlign: 'right' }}>
                                {new Date(machine.lastAnalyzedAt).toLocaleString()}
                            </div>
                        )}

                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 18 }}>📋</span>
                                <span style={{ fontWeight: 700, color: '#0369a1', fontSize: 14 }}>Análisis IA</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#0c4a6e', margin: 0, lineHeight: 1.4 }}>
                                {machine.lastAnalysis 
                                    ? "Reporte completo disponible. Incluye predicción de tendencias y detección de anomalías." 
                                    : "No se han generado reportes de IA para esta máquina aún."}
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleViewReport}
                            disabled={!machine.lastAnalysis}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: machine.lastAnalysis ? '#2563eb' : '#f1f5f9',
                                border: machine.lastAnalysis ? 'none' : '1px solid #e2e8f0',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                color: machine.lastAnalysis ? 'white' : '#94a3b8',
                                cursor: machine.lastAnalysis ? 'pointer' : 'not-allowed',
                                opacity: machine.lastAnalysis ? 1 : 0.7,
                                transition: 'all 0.2s'
                            }}
                        >
                            {machine.lastAnalysis ? "Ver reporte completo" : "Sin reporte disponible"}
                        </button>
                    </SidebarCard>
                </Sidebar>
            </ContentGrid>
        </Container>
    );
}