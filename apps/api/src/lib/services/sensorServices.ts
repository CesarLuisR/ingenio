import { ConfigData, ReadingData } from "../../types/sensorTypes";

export async function createPublishInfo(data: ReadingData, config: ConfigData) {
    const metricsReport: Record<string, any> = {};
    const issues: { metric: string; type: string; value: number; limit: number }[] = [];
    let severity = 0;

    for (const [category, readings] of Object.entries(data.metrics)) {
        metricsReport[category] = {};

        for (const [metricName, value] of Object.entries(readings)) {
            const configMetric = config.metricsConfig?.[category]?.[metricName];

            if (!configMetric) {
                metricsReport[category][metricName] = { value, status: "unknown" };
                continue;
            }

            const { min, max } = configMetric;
            let status: "ok" | "low" | "high" = "ok";

            if (min !== undefined && value < min) {
                status = "low";
                issues.push({ metric: `${category}.${metricName}`, type: "low", value, limit: min });
            } else if (max !== undefined && value > max) {
                status = "high";
                issues.push({ metric: `${category}.${metricName}`, type: "high", value, limit: max });
            }

            metricsReport[category][metricName] = { value, status };

            if (status !== "ok") {
                const isCritical =
                    (max !== undefined && value > max * 1.1) ||
                    (min !== undefined && value < min * 0.9);
                severity = Math.max(severity, isCritical ? 2 : 1);
            }
        }
    }

    const status =
        severity === 0 ? "ok" :
            severity === 1 ? "warning" :
                "critical";

    return {
        sensorId: data.sensorId,
        timestamp: data.timestamp,
        status,
        issues,
        metrics: metricsReport,
        totalIssues: issues.length,
        severityLevel: severity
    };
}
