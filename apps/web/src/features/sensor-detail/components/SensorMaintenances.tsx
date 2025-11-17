import { InfoSection } from "../styled";
import type { Maintenance } from "../../../types";

interface SensorMaintenancesProps {
	items: Maintenance[];
}

export function SensorMaintenances({ items }: SensorMaintenancesProps) {
	return (
		<InfoSection>
			<h2>Mantenimientos</h2>

			{items.length === 0 && <p>No hay mantenimientos registrados.</p>}

			{items.length > 0 && (
				<ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
					{items.map((m) => (
						<li
							key={m.id}
							style={{
								padding: "0.9rem 1rem",
								marginBottom: "0.75rem",
								borderRadius: "8px",
								background: "#f8fafc",
								border: "1px solid #e2e8f0",
							}}
						>
							<div style={{ fontWeight: 600, color: "#0f172a" }}>
								{m.type}
							</div>

							<div style={{ marginTop: "0.25rem", color: "#475569" }}>
								🧰 Técnico:{" "}
								<b>{m.technician?.name ?? "No asignado"}</b>
							</div>

							<div style={{ marginTop: "0.25rem", color: "#475569" }}>
								📅 Fecha:{" "}
								<b>
									{new Date(m.performedAt).toLocaleDateString()}
								</b>
							</div>

							{m.durationMinutes && (
								<div style={{ marginTop: "0.25rem", color: "#475569" }}>
									⏱ Duración: <b>{m.durationMinutes} min</b>
								</div>
							)}

							{m.cost && (
								<div style={{ marginTop: "0.25rem", color: "#475569" }}>
									💰 Costo: <b>${m.cost.toFixed(2)}</b>
								</div>
							)}

							{m.notes && (
								<div
									style={{
										marginTop: "0.5rem",
										color: "#334155",
										fontStyle: "italic",
									}}
								>
									📝 {m.notes}
								</div>
							)}
						</li>
					))}
				</ul>
			)}
		</InfoSection>
	);
}
