import { InfoSection } from "../styled";
import type { Maintenance } from "../../../types";

interface SensorMaintenancesProps {
	items: Maintenance[];
}

export function SensorMaintenances({ items }: SensorMaintenancesProps) {
	return (
		<InfoSection>
			<h2>Mantenimientos</h2>
			{items.length > 0 ? (
				<ul>
					{items.map((m) => (
						<li key={m.id}>
							{/* <b>{m.}</b> — {m.description} (
							{new Date(m.scheduledDate).toLocaleDateString()}) */}
						</li>
					))}
				</ul>
			) : (
				<p>No hay mantenimientos.</p>
			)}
		</InfoSection>
	);
}
