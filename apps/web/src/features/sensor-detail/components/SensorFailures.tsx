import { InfoSection, FailuresList, FailureItem, FailureTitle, FailureMeta } from "../styled";
import { ROLES, type Failure } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

interface SensorFailuresProps {
	items: Failure[];
}

export function SensorFailures({ items }: SensorFailuresProps) {
	const user = useSessionStore(s => s.user);
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

	if (isSuperAdmin) return;

	return (
		<InfoSection>
			<h2>Fallas</h2>

			{items.length === 0 && <p>No se han detectado fallas.</p>}

			{items.length > 0 && (
				<FailuresList>
					{items.map((f) => {
						const occurred = new Date(f.occurredAt).toLocaleString();
						const resolved = f.resolvedAt
							? new Date(f.resolvedAt).toLocaleString()
							: null;

						return (
							<FailureItem key={f.id}>
								<FailureTitle>
									{f.description}
								</FailureTitle>

								<FailureMeta>
									⚙️ Severidad:{" "}
									<b style={{ textTransform: "capitalize" }}>
										{f.severity}
									</b>
								</FailureMeta>

								<FailureMeta>
									📌 Estado:{" "}
									<b style={{ textTransform: "capitalize" }}>
										{f.status}
									</b>
								</FailureMeta>

								<FailureMeta>
									🕒 Ocurrió: <b>{occurred}</b>
								</FailureMeta>

								{resolved && (
									<FailureMeta>
										✅ Resuelta: <b>{resolved}</b>
									</FailureMeta>
								)}

								{!resolved && (
									<FailureMeta style={{ color: "#b91c1c", fontWeight: 500 }}>
										⛔ Aún no resuelta
									</FailureMeta>
								)}
							</FailureItem>
						);
					})}
				</FailuresList>
			)}
		</InfoSection>
	);
}
