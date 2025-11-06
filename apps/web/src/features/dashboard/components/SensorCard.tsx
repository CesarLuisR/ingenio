import { Link } from "react-router-dom";
import type { Reading } from "../../../lib/api";
import { Card, Status } from "../styled";

export function SensorCard({ reading }: { reading: Reading }) {
	return (
		<Link
			to={`/sensor/${reading.sensorId}`}
			style={{ textDecoration: "none" }}>
			<Card>
				<h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
					{reading.sensorId}
				</h2>

				<p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
					Última actualización:{" "}
					{new Date(reading.timestamp).toLocaleTimeString()}
				</p>

				<Status status={reading.status}>
					{reading.status.toUpperCase()}
				</Status>

				<p
					style={{
						fontSize: "0.875rem",
						color: "#9ca3af",
						marginTop: "0.5rem",
					}}>
					Total de métricas:{" "}
					{Object.keys(reading.metrics || {}).length}
				</p>

				<p
					style={{
						fontSize: "0.875rem",
						color: "#9ca3af",
						marginTop: "0.25rem",
					}}>
					Severidad: {reading.severityLevel ?? "-"} | Issues:{" "}
					{reading.totalIssues ?? 0}
				</p>
			</Card>
		</Link>
	);
}
