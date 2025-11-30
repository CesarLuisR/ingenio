import { InfoSection } from "../styled";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import { useReadingsStore } from "../../../store/readingState"; // 1. Importar store
import type { Sensor } from "../../../types";

export function SensorMetrics({ id }: { id?: number | null }) {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [now, setNow] = useState(Date.now()); // 2. Estado para forzar re-render por tiempo
    
    // 3. Obtener lecturas en tiempo real
    const sensorMap = useReadingsStore((s) => s.sensorMap);

    // Cargar la info base del sensor (configuración, lastSeen histórico, etc.)
    useEffect(() => {
        if (id) {
            api.getSensor(id).then(setSensor).catch(console.error);
        }
    }, [id]);

    // Reloj interno: Actualiza 'now' cada segundo para verificar timeouts en tiempo real
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // 4. Lógica central (Replicada de useActiveSensors)
    const health = useMemo(() => {
        if (!sensor) return null;

        const key = sensor.sensorId ?? String(sensor.id);
        const readings = sensorMap.get(key) || [];

        // A. Configurar Umbral (Threshold)
        // Igual que en useActiveSensors: Intervalo * 2.5 o mínimo 10 segs
        const config = sensor.config as any;
        const intervalMs = config?.intervalMs ? Number(config.intervalMs) : 60000;
        const threshold = Math.max(intervalMs * 2.5, 10000);

        // B. Determinar última vez visto
        let lastTime = 0;
        
        // Prioridad 1: WebSocket (Store)
        if (readings.length > 0) {
            const last = readings[readings.length - 1];
            lastTime = typeof last.timestamp === "string" 
                ? Date.parse(last.timestamp) 
                : Number(last.timestamp);
        } 
        // Prioridad 2: Base de Datos (Snapshot inicial)
        else if (sensor.lastSeen) {
            lastTime = new Date(sensor.lastSeen).getTime();
        }

        // C. Calcular Estado
        // Está activo si el sensor está habilitado en BD Y está dentro del umbral de tiempo
        const isWithinTime = lastTime > 0 && (now - lastTime < threshold);
        const isActive = sensor.active && isWithinTime;

        return {
            active: isActive,
            enabled: sensor.active, // Para diferenciar "Offline" de "Deshabilitado" si quisieras
            lastSeen: lastTime ? new Date(lastTime) : null,
            // todo: Esto hay que arreglarlo
            hasAnalysis: false 
        };

    }, [sensor, sensorMap, now]); // Se recalcula cuando cambia el sensor, llegan lecturas o pasa el tiempo

    if (!health) return null;

    return (
        <InfoSection style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
            <h2 style={{ marginBottom: 20 }}>Salud del Sistema</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <KpiCard 
                    label="Estado Conexión" 
                    value={health.active ? "En línea" : "Offline"} 
                    color={health.active ? "#059669" : "#64748b"}
                    bg={health.active ? "#ecfdf5" : "#f1f5f9"}
                    // Opcional: Mostrar punto rojo si está deshabilitado manualmente
                    dotColor={!health.enabled ? "#ef4444" : (health.active ? "#059669" : "#94a3b8")}
                />
                <KpiCard 
                    label="Última Señal" 
                    value={health.lastSeen ? health.lastSeen.toLocaleTimeString() : "Nunca"} 
                    color="#0284c7"
                    bg="#e0f2fe"
                    dotColor="#0284c7"
                />
                <KpiCard 
                    label="Diagnóstico IA" 
                    value={health.hasAnalysis ? "Procesado" : "Pendiente"} 
                    color="#7c3aed"
                    bg="#f5f3ff"
                    dotColor="#7c3aed"
                />
            </div>
        </InfoSection>
    );
}

// Componente visual
const KpiCard = ({ label, value, color, bg, dotColor }: any) => (
    <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: color }}>
                {value}
            </span>
             <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor }} />
        </div>
    </div>
);