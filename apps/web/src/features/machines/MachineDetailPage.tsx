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

export default function MachineDetailPage() {
    const { id } = useParams();
    const machineId = Number(id);

    const {
        machine,
        sensors,
        maintenances,
        failures,
        metrics,
        loading,
        error,
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
            {/* HEADER COMPACTO PERO INFORMATIVO */}
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
                {/* COLUMNA IZQUIERDA: CONTENIDO DINÁMICO (TABS) */}
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

                    {/* CONTENIDO DE LAS PESTAÑAS */}
                    
                    {/* --- MANTENIMIENTOS --- */}
                    {tab === "mantenimientos" && (
                        <Section>
                            <SectionTitle>Registro de intervenciones</SectionTitle>
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
                                                <span>Técnico: <strong>{mt.technician?.name ?? "N/A"}</strong></span>
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
                                                <span className="date" style={{background: s.active ? '#ecfdf5' : '#f1f5f9', color: s.active ? '#059669' : '#64748b'}}>
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

                {/* COLUMNA DERECHA: SIDEBAR STICKY */}
                <Sidebar>
                    {/* CARD: INFORMACIÓN GENERAL */}
                    <SidebarCard>
                        <SectionTitle style={{marginBottom: 16}}>Ficha Técnica</SectionTitle>
                        <InfoList>
                            <div><span>Nombre</span> <span>{machine.name}</span></div>
                            <div><span>Código</span> <span>{machine.code}</span></div>
                            <div><span>Tipo</span> <span>{machine.type ?? "-"}</span></div>
                            <div><span>Ubicación</span> <span>{machine.location ?? "-"}</span></div>
                            <div><span>Estado</span> <span style={{color: machine.active ? '#16a34a' : '#dc2626'}}>{machine.active ? "Activa" : "Inactiva"}</span></div>
                        </InfoList>
                        {machine.description && (
                            <div style={{marginTop: 16, fontSize: 13, color: '#64748b', lineHeight: 1.5, background: '#f8fafc', padding: 10, borderRadius: 8}}>
                                {machine.description}
                            </div>
                        )}
                    </SidebarCard>

                    {/* CARD: KPIs / MÉTRICAS */}
                    <SidebarCard>
                        <SectionTitle style={{marginBottom: 16}}>KPIs de Rendimiento</SectionTitle>
                        {!metrics ? (
                            <div style={{color: '#94a3b8', fontSize: 13, textAlign: 'center'}}>Sin datos métricos</div>
                        ) : (
                            <MetricsGrid>
                                <MetricCard>
                                    <MetricLabel>Disponibilidad</MetricLabel>
                                    <MetricValue>{metrics.availability ?? "-"}</MetricValue>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>Confiabilidad</MetricLabel>
                                    <MetricValue>{metrics.reliability ?? "-"}</MetricValue>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>MTBF</MetricLabel>
                                    <MetricValue>{metrics.mtbf ?? "-"}</MetricValue>
                                </MetricCard>
                                <MetricCard>
                                    <MetricLabel>MTTR</MetricLabel>
                                    <MetricValue>{metrics.mttr ?? "-"}</MetricValue>
                                </MetricCard>
                            </MetricsGrid>
                        )}
                    </SidebarCard>
                </Sidebar>
            </ContentGrid>
        </Container>
    );
}