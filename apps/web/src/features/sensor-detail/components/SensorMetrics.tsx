import { InfoSection } from "../styled";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export function SensorMetrics({ sensorId }: { sensorId?: number | null }) {
    const [health, setHealth] = useState<any>(null);

    useEffect(() => {
        if (sensorId) {
            api.getSensorHealth(sensorId).then(setHealth).catch(console.error);
        }
    }, [sensorId]);

    if (!health) return null; // O un skeleton loader

    return (
        <InfoSection style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
            <h2 style={{ marginBottom: 20 }}>Salud del Sistema</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <KpiCard 
                    label="Estado Conexión" 
                    value={health.active ? "En línea" : "Offline"} 
                    color={health.active ? "#059669" : "#64748b"}
                    bg={health.active ? "#ecfdf5" : "#f1f5f9"}
                />
                <KpiCard 
                    label="Última Señal" 
                    value={health.lastSeen ? new Date(health.lastSeen).toLocaleTimeString() : "N/A"} 
                    color="#0284c7"
                    bg="#e0f2fe"
                />
                <KpiCard 
                    label="Diagnóstico IA" 
                    value={health.lastAnalysis ? "Procesado" : "Pendiente"} 
                    color="#7c3aed"
                    bg="#f5f3ff"
                />
            </div>
        </InfoSection>
    );
}

const KpiCard = ({ label, value, color, bg }: any) => (
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
            <div style={{ width: 40, height: 40, borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                {/* Podrías poner un icono aquí */}
                Start
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                {value}
            </span>
        </div>
    </div>
);