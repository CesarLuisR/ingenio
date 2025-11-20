import { useParams } from "react-router-dom";
import { Page, HeaderContainer, TitleBlock, Title, Sub, StatusBadge } from "./styled";
import { useSensorDetail } from "./hooks/useSensorDetail";
import { SensorCharts } from "./components/SensorChart";
import { SensorMaintenances } from "./components/SensorMaintenances";
import { SensorFailures } from "./components/SensorFailures";
import { SensorMetrics } from "./components/SensorMetrics";

export default function SensorDetail() {
    const { id } = useParams<{ id: string }>();
    const {
        sensorName,
        maintenances,
        failures,
        latest,
        chartData,
        sensorIntId,
    } = useSensorDetail(id);

    const status = latest?.status || "unknown";
    
    // Helpers para texto de estado
    const statusLabel = {
        ok: "Operativo",
        warning: "Advertencia",
        critical: "Crítico",
        unknown: "Desconocido"
    }[status] || status;

    return (
        <Page>
            {/* Header Principal */}
            <HeaderContainer>
                <TitleBlock>
                    <Title>{sensorName || "Cargando..."}</Title>
                    <Sub>ID del Dispositivo: {id}</Sub>
                </TitleBlock>
                
                <StatusBadge status={status}>
                    {status === 'ok' && '✅'} 
                    {status === 'warning' && '⚠️'}
                    {status === 'critical' && '🚨'}
                    {statusLabel}
                </StatusBadge>
            </HeaderContainer>

            {/* Sección de Métricas KPIs (Health) */}
            <SensorMetrics sensorId={sensorIntId} />

            {/* Gráficos Individuales por Grupo */}
            <div style={{ marginTop: '40px' }}>
                <SensorCharts chartData={chartData} latest={latest} />
            </div>

            {/* Tablas de Historial (Grid layout para aprovechar espacio) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginTop: '40px' }}>
                <SensorFailures items={failures} />
                <SensorMaintenances items={maintenances} />
            </div>
        </Page>
    );
}