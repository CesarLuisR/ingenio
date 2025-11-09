import { ConfigData, ReadingData } from "../../types/sensorTypes";

interface Issue {
    metric: string;
    type: "low" | "high";
    value: number;
    limit: number;
    exceedancePercent: number;
}

interface PublishInfo {
    sensorId: string;
    timestamp: string;
    status: "ok" | "warning" | "critical";
    issues: Issue[];
    metrics: Record<string, any>;
    totalIssues: number;
    severityLevel: number;
}

export async function createPublishInfo(
    data: ReadingData,
    config: ConfigData
): Promise<PublishInfo> {
    const metricsReport: Record<string, any> = {};
    const issues: Issue[] = [];
    let severity = 0;

    for (const [category, readings] of Object.entries(data.metrics)) {
        metricsReport[category] = {};

        for (const [metricName, value] of Object.entries(readings)) {
            if (typeof value !== "number" || isNaN(value)) {
                metricsReport[category][metricName] = {
                    value,
                    status: "invalid",
                };
                continue;
            }

            const configMetric = config.metricsConfig?.[category]?.[metricName];
            if (!configMetric) {
                metricsReport[category][metricName] = {
                    value,
                    status: "unknown",
                };
                continue;
            }

            const { min, max } = configMetric;
            let status: "ok" | "low" | "high" = "ok";
            let exceedancePercent = 0;

            // --- Verificar límite inferior ---
            if (min !== undefined && value < min) {
                status = "low";
                exceedancePercent = ((min - value) / Math.abs(min || 1)) * 100;

                issues.push({
                    metric: `${category}.${metricName}`,
                    type: "low",
                    value,
                    limit: min,
                    exceedancePercent,
                });
            }
            // --- Verificar límite superior ---
            else if (max !== undefined && value > max) {
                status = "high";
                exceedancePercent = ((value - max) / Math.abs(max || 1)) * 100;

                issues.push({
                    metric: `${category}.${metricName}`,
                    type: "high",
                    value,
                    limit: max,
                    exceedancePercent,
                });
            }

            // --- Determinar severidad (ok / warning / critical) ---
            let metricSeverity = 0; // 0 = ok, 1 = warning, 2 = critical
            if (status !== "ok") {
                if (exceedancePercent > 20) {
                    metricSeverity = 2; // critical
                } else {
                    metricSeverity = 1; // warning
                }
            }

            severity = Math.max(severity, metricSeverity);

            const metricStatus =
                metricSeverity === 2
                    ? "critical"
                    : metricSeverity === 1
                    ? "warning"
                    : "ok";

            metricsReport[category][metricName] = { value, status: metricStatus };
        }
    }

    const overallStatus: "ok" | "warning" | "critical" =
        severity === 0 ? "ok" : severity === 1 ? "warning" : "critical";

    return {
        sensorId: data.sensorId,
        timestamp: data.timestamp,
        status: overallStatus,
        issues,
        metrics: metricsReport,
        totalIssues: issues.length,
        severityLevel: severity,
    };
}

// --- Función auxiliar opcional ---
export function calculateCriticalityAlternative(
    value: number,
    min?: number,
    max?: number
): boolean {
    if (max !== undefined && value > max) {
        const excess = ((value - max) / Math.abs(max || 1)) * 100;
        return excess > 20; // >20% más allá del límite → crítico
    }

    if (min !== undefined && value < min) {
        const deficit = ((min - value) / Math.abs(min || 1)) * 100;
        return deficit > 20;
    }

    return false;
}
