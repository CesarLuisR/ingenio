import { ReadingData } from "../../types/sensorTypes";
import { getSensorConfig } from "../repositories/sensorRepository";

export async function createPublishInfo(data: ReadingData) {
    const config = await getSensorConfig(data.sensorId);
    if (!config) {
        console.warn(`No config found for sensor ${data.sensorId}`);
        return {
            sensorId: data.sensorId,
            timestamp: data.timestamp,
            status: "unknown",
            issues: [],
            metrics: data.metrics
        };
    }

    const metricsReport: Record<string, any> = {};
    const issues: { metric: string; type: string; value: number; limit: number }[] = [];
    let severity = 0; // 0 = ok, 1 = warning, 2 = critical

    for (const [category, readings] of Object.entries(data.metrics)) {
        metricsReport[category] = {};

        for (const [metric, value] of Object.entries(readings)) {
            const configMetric = config.metricsConfig?.[category]?.[metric];
            if (!configMetric) {
                metricsReport[category][metric] = { value, status: "unknown" };
                continue;
            }

            const { min, max } = configMetric;
            let status: string = "ok";

            if (min !== undefined && value < min) {
                status = "low";
                issues.push({ metric: `${category}.${metric}`, type: "low", value, limit: min });
            }
            if (max !== undefined && value > max) {
                status = "high";
                issues.push({ metric: `${category}.${metric}`, type: "high", value, limit: max });
            }

            metricsReport[category][metric] = { value, status };

            if (status !== "ok") {
                severity = Math.max(severity, value > (max ?? Infinity) * 1.1 || value < (min ?? -Infinity) * 0.9 ? 2 : 1);
            }
        }
    }

    const status =
        severity === 0 ? "ok" : severity === 1 ? "warning" : "critical";

    return {
        sensorId: data.sensorId,
        timestamp: data.timestamp,
        status,
        issues,
        metrics: metricsReport,
        totalIssues: issues.length,
        severityLevel: severity,
    };
}