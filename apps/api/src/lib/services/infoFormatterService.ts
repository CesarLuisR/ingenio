import { ConfigData, ReadingData } from "../../types/sensorTypes";

interface Issue {
	metric: string;
	type: "low" | "high";
	value: number;
	limit: number;
	exceedancePercent: number;
}

interface FormattedInfo {
	sensorId: string;
	timestamp: string;
	status: "ok" | "warning" | "critical"; // estado global
	metrics: Record<string, Record<string, { value: number; status: string }>>; // 🔹 cada métrica con estado propio
	issues: Issue[];
	totalIssues: number;
	severityLevel: number;
}

export async function createFormattedInfoInfo(
	data: ReadingData,
	config: ConfigData
): Promise<FormattedInfo> {
	const metricsReport: Record<string, any> = {};
	const issues: Issue[] = [];
	let maxSeverity = 0;

	for (const [category, readings] of Object.entries(data.metrics)) {
		metricsReport[category] = {};

		for (const [metricName, value] of Object.entries(readings)) {
			// Validar el valor
			if (typeof value !== "number" || isNaN(value)) {
				metricsReport[category][metricName] = { value, status: "invalid" };
				continue;
			}

			const cfg = config.metricsConfig?.[category]?.[metricName];
			if (!cfg) {
				metricsReport[category][metricName] = { value, status: "unknown" };
				continue;
			}

			const { min, max } = cfg;
			let localStatus: "ok" | "low" | "high" = "ok";
			let exceedance = 0;

			if (min !== undefined && value < min) {
				localStatus = "low";
				exceedance = ((min - value) / Math.abs(min || 1)) * 100;
				issues.push({
					metric: `${category}.${metricName}`,
					type: "low",
					value,
					limit: min,
					exceedancePercent: exceedance,
				});
			} else if (max !== undefined && value > max) {
				localStatus = "high";
				exceedance = ((value - max) / Math.abs(max || 1)) * 100;
				issues.push({
					metric: `${category}.${metricName}`,
					type: "high",
					value,
					limit: max,
					exceedancePercent: exceedance,
				});
			}

			// 🔹 Evaluar severidad individual
			let metricSeverity = 0;
			if (localStatus !== "ok") {
				metricSeverity = exceedance > 20 ? 2 : 1;
			}

			maxSeverity = Math.max(maxSeverity, metricSeverity);

			const metricStatus =
				metricSeverity === 2
					? "critical"
					: metricSeverity === 1
						? "warning"
						: "ok";

			// 🔹 Guardar el estado por métrica
			metricsReport[category][metricName] = {
				value,
				status: metricStatus,
			};
		}
	}

	const overallStatus: "ok" | "warning" | "critical" =
		maxSeverity === 0 ? "ok" : maxSeverity === 1 ? "warning" : "critical";

	return {
		sensorId: data.sensorId,
		timestamp: data.timestamp,
		status: overallStatus, // estado global
		metrics: metricsReport, // 🔹 cada métrica con su status
		issues,
		totalIssues: issues.length,
		severityLevel: maxSeverity,
	};
}
