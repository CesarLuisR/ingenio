import { InfoSection } from "../styled";
import type { Failure } from "../../../types";

interface SensorFailuresProps {
	items: Failure[];
}

export function SensorFailures({ items }: SensorFailuresProps) {
	return (
		<InfoSection>
			<h2>Fallas</h2>
			{items.length > 0 ? (
				<ul>
					{items.map((f) => (
						<li key={f.id}>
							<b>{f.sensorId}</b> — {f.description} ({f.occurredAt})
						</li>
					))}
				</ul>
			) : (
				<p>No se han detectado fallas.</p>
			)}
		</InfoSection>
	);
}
