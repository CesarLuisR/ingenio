// src/components/SensorCard.tsx
import { Link } from "react-router-dom";
import { Card, Status } from "../styled";
import type { SensorWithStatus } from "../hooks/useDashboardData"; // We'll define this in Dashboard or reuse

export function SensorCard({ sensor }: { sensor: SensorWithStatus }) {
    // Determine visual status based on active/inactive + lastStatus
    const visualStatus = !sensor.active ? "offline" : sensor.lastStatus || "ok";
    
    return (
        <Link to={`/sensor/${sensor.id}`} style={{ textDecoration: "none" }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                            {sensor.name}
                        </h2>
                        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>
                            {sensor.type}
                        </p>
                    </div>
                    <Status status={visualStatus === 'offline' ? 'critical' : visualStatus}>
                        {visualStatus}
                    </Status>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: "#94a3b8" }}>Última señal:</span>
                    <span style={{ color: "#334155", fontWeight: 500 }}>
                        {sensor.lastReadingTime 
                            ? new Date(sensor.lastReadingTime).toLocaleTimeString() 
                            : "—"}
                    </span>
                </div>
            </Card>
        </Link>
    );
}