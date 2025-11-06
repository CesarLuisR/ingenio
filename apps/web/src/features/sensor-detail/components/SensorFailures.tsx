import { InfoSection } from "../styled";
import type { Failure } from "../../../lib/api";

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
							<b>{f.severity}</b> — {f.description} ({f.status})
						</li>
					))}
				</ul>
			) : (
				<p>No se han detectado fallas.</p>
			)}
		</InfoSection>
	);
}
