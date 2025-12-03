import { InfoSection, KpiGrid, KpiCardStyled, KpiLabel, KpiValueRow, KpiValue, KpiDot } from "../styled";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import { useReadingsStore } from "../../../store/readingState";
import type { Sensor } from "../../../types";

export function SensorMetrics({ 
    id, 
    lastAnalysis,
    handleViewReport 
}: { 
    id?: number | null, 
    lastAnalysis: boolean,
    handleViewReport: () => void 
}) {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [now, setNow] = useState(Date.now());
    
    const sensorMap = useReadingsStore((s) => s.sensorMap);

    useEffect(() => {
        if (id) {
            api.getSensor(id).then(setSensor).catch(console.error);
        }
    }, [id]);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const health = useMemo(() => {
        if (!sensor) return null;

        const key = sensor.sensorId ?? String(sensor.id);
        const readings = sensorMap.get(key) || [];

        const config = sensor.config as any;
        const intervalMs = config?.intervalMs ? Number(config.intervalMs) : 60000;
        const threshold = Math.max(intervalMs * 2.5, 10000);

        let lastTime = 0;
        
        if (readings.length > 0) {
            const last = readings[readings.length - 1];
            lastTime = typeof last.timestamp === "string" 
                ? Date.parse(last.timestamp) 
                : Number(last.timestamp);
        } 
        else if (sensor.lastSeen) {
            lastTime = new Date(sensor.lastSeen).getTime();
        }

        const isWithinTime = lastTime > 0 && (now - lastTime < threshold);
        const isActive = sensor.active && isWithinTime;

        return {
            active: isActive,
            enabled: sensor.active,
            lastSeen: lastTime ? new Date(lastTime) : null,
            hasAnalysis: lastAnalysis 
        };

    }, [sensor, sensorMap, now]);

    if (!health) return null;

    return (
        <InfoSection style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
            <h2 style={{ marginBottom: 20 }}>Salud del Sistema</h2>
            
            <KpiGrid>
                <KpiCard 
                    label="Estado Conexión" 
                    value={health.active ? "En línea" : "Offline"} 
                    color={health.active ? "#059669" : "#64748b"}
                    dotColor={!health.enabled ? "#ef4444" : (health.active ? "#059669" : "#94a3b8")}
                />
                <KpiCard 
                    label="Última Señal" 
                    value={health.lastSeen ? health.lastSeen.toLocaleTimeString() : "Nunca"} 
                    color="#0284c7"
                    dotColor="#0284c7"
                />
                <KpiCard 
                    onClick={handleViewReport}
                    label="Diagnóstico IA" 
                    value={health.hasAnalysis ? "Procesado" : "Pendiente"} 
                    color="#7c3aed"
                    dotColor="#7c3aed"
                    clickable
                />
            </KpiGrid>
        </InfoSection>
    );
}

const KpiCard = ({ label, value, color, dotColor, onClick, clickable }: any) => (
    <KpiCardStyled onClick={onClick} $clickable={clickable}>
        <KpiLabel>{label}</KpiLabel>
        <KpiValueRow>
            <KpiValue $color={color}>{value}</KpiValue>
            <KpiDot $color={dotColor} />
        </KpiValueRow>
    </KpiCardStyled>
);