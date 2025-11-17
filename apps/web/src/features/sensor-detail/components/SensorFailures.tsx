import { InfoSection } from "../styled";
import type { Failure } from "../../../types";

interface SensorFailuresProps {
	items: Failure[];
}

export function SensorFailures({ items }: SensorFailuresProps) {
	return (
		<InfoSection>
			<h2>Fallas</h2>

			{items.length === 0 && <p>No se han detectado fallas.</p>}

			{items.length > 0 && (
				<ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
					{items.map((f) => {
						const occurred = new Date(f.occurredAt).toLocaleString();
						const resolved = f.resolvedAt
							? new Date(f.resolvedAt).toLocaleString()
							: null;

						return (
							<li
								key={f.id}
								style={{
									padding: "0.9rem 1rem",
									marginBottom: "0.75rem",
									borderRadius: "8px",
									background: "#fff7f7",
									border: "1px solid #fecaca",
								}}
							>
								<div
									style={{
										fontWeight: 600,
										color: "#991b1b",
										fontSize: "1rem",
									}}
								>
									{f.description}
								</div>

								<div
									style={{
										marginTop: "0.35rem",
										color: "#6b7280",
										fontSize: "0.9rem",
									}}
								>
									⚙️ Severidad:{" "}
									<b style={{ textTransform: "capitalize" }}>
										{f.severity}
									</b>
								</div>

								<div
									style={{
										marginTop: "0.2rem",
										color: "#6b7280",
										fontSize: "0.9rem",
									}}
								>
									📌 Estado:{" "}
									<b style={{ textTransform: "capitalize" }}>
										{f.status}
									</b>
								</div>

								<div
									style={{
										marginTop: "0.2rem",
										color: "#475569",
										fontSize: "0.9rem",
									}}
								>
									🕒 Ocurrió: <b>{occurred}</b>
								</div>

								{resolved && (
									<div
										style={{
											marginTop: "0.2rem",
											color: "#475569",
											fontSize: "0.9rem",
										}}
									>
										✅ Resuelta: <b>{resolved}</b>
									</div>
								)}

								{!resolved && (
									<div
										style={{
											marginTop: "0.2rem",
											color: "#b91c1c",
											fontSize: "0.9rem",
											fontWeight: 500,
										}}
									>
										⛔ Aún no resuelta
									</div>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</InfoSection>
	);
}
