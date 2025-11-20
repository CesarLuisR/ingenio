import { useState } from "react";
import { useParams } from "react-router-dom";
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

// --- FUNCIÓN DE AYUDA PARA FORMATEAR KPIS ---
// Si es undefined devuelve "-", si es número lo redondea a 2 decimales
const formatMetric = (value: number | undefined | null, suffix: string = "") => {
    if (value === undefined || value === null) return "-";
    return `${Number(value).toFixed(2)}${suffix}`;
};

export default function MachineDetailPage() {
    const { id } = useParams();
    const machineId = Number(id);

    // Extraemos "reload" del hook
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

    /* LOADING */
    if (loading) return <Container>Cargando información...</Container>;

    /* ERROR */
    if (error) return (
        <Container>
            <div style={{ padding: 40, textAlign: "center", background: '#fee2e2', color: '#b91c1c', borderRadius: 12 }}>
                {error}
            </div>
        </Container>
    );

    /* NO MACHINE */
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
                    <StatusTag $active={machine.active}>
                        {machine.active ? "Operativa" : "Fuera de Servicio"}
                    </StatusTag>
                </HeaderTop>

                <TagRow>
                    {machine.type && <Tag>{machine.type}</Tag>}
                    <Tag>{sensors.length} sensores</Tag>
                    <Tag>{maintenances.length} mantenimientos</Tag>
                    <Tag style={{ color: failures.length > 0 ? '#ef4444' : 'inherit' }}>
                        {failures.length} fallas
                    </Tag>
                </TagRow>
            </Header>

            <ContentGrid>
                {/* COLUMNA IZQUIERDA: CONTENIDO (TABS) */}
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

                    {/* --- MANTENIMIENTOS --- */}
                    {tab === "mantenimientos" && (
                        <Section>
                            <SectionTitle>
                                Registro de intervenciones
                                {/* Botón para actualizar manualmente si editas un técnico */}
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
                                                {/* Mostrar técnico correctamente */}
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

                    {/* --- FALLAS --- */}
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
                                            {f.resolvedAt && (
                                                <div className="notes" style={{ background: '#f0fdf4', color: '#166534' }}>
                                                    ✅ Resuelto el {new Date(f.resolvedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </InfoCard>
                                    ))}
                                </CardList>
                            )}
                        </Section>
                    )}

                    {/* --- SENSORES --- */}
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
                    {/* CARD: INFO GENERAL */}
                    <SidebarCard>
                        <SectionTitle style={{ marginBottom: 16 }}>Ficha Técnica</SectionTitle>
                        <InfoList>
                            <div><span>Nombre</span> <span>{machine.name}</span></div>
                            <div><span>Código</span> <span>{machine.code}</span></div>
                            <div><span>Tipo</span> <span>{machine.type ?? "-"}</span></div>
                            <div><span>Ubicación</span> <span>{machine.location ?? "-"}</span></div>
                            <div><span>Fecha de Registro</span> <span>{new Date(machine.createdAt).toLocaleString()}</span></div>
                            <div><span>Fecha de Actualización</span> <span>{new Date(machine.updatedAt).toLocaleString()}</span></div>
                            <div><span>Estado</span> <span style={{ color: machine.active ? '#16a34a' : '#dc2626' }}>{machine.active ? "Activa" : "Inactiva"}</span></div>
                        </InfoList>
                        {machine.description && (
                            <div style={{ marginTop: 16, fontSize: 13, color: '#64748b', lineHeight: 1.5, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                                {machine.description}
                            </div>
                        )}
                    </SidebarCard>

                    {/* CARD: KPIs / MÉTRICAS */}
                    <SidebarCard>
                        <SectionTitle style={{ marginBottom: 16 }}>KPIs de Rendimiento</SectionTitle>
                        {!metrics ? (
                            <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sin datos métricos</div>
                        ) : (
                            <MetricsGrid>
                                <MetricCard>
                                    <MetricLabel>Disponibilidad</MetricLabel>
                                    {/* Usamos title para mostrar valor completo al pasar mouse */}
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

                    {/* CARD: ÚLTIMO REPORTE (Mockup) */}
                    <SidebarCard>
                        <SectionTitle style={{ marginBottom: 12 }}>Último Reporte</SectionTitle>
                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 18 }}>📋</span>
                                <span style={{ fontWeight: 700, color: '#0369a1', fontSize: 14 }}>Análisis Diario</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#0c4a6e', margin: 0, lineHeight: 1.4 }}>
                                El rendimiento es estable. No se detectan anomalías críticas recientes.
                            </p>
                        </div>
                        <button style={{
                            width: '100%',
                            padding: '8px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'not-allowed',
                            opacity: 0.7
                        }} disabled>
                            Ver reporte completo (Próximamente)
                        </button>
                    </SidebarCard>
                </Sidebar>
            </ContentGrid>
        </Container>
    );
}