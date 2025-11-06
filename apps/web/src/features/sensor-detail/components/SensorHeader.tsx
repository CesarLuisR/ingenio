import { Title, Sub, Status as StatusBadge } from "../styled";

export const STATUS_LABELS: Record<string, string> = {
	ok: "✅ OK",
	warning: "⚠️ Warning",
	critical: "🚨 Critical",
};

export function getStatusLabel(status?: string) {
	if (!status) return "unknown";
	return STATUS_LABELS[status] ?? "–";
}

interface SensorHeaderProps {
	name: string;
	id?: string;
	status?: string;
}

export function SensorHeader({ name, id, status }: SensorHeaderProps) {
	return (
		<>
			<Title>
				{name || "Sensor"} {id ? `(${id})` : null}
			</Title>
			<Sub>
				Estado actual:{" "}
				<StatusBadge status={status || "unknown"}>
					{getStatusLabel(status)}
				</StatusBadge>
			</Sub>
		</>
	);
}
