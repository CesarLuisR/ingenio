import { InfoSection, CodeBox } from "../styled";
import type { AnalysisResponse } from "../../../types";

interface SensorAnalysisProps {
	data: AnalysisResponse | null;
}

export function SensorAnalysis({ data }: SensorAnalysisProps) {
	return (
		<InfoSection>
			<h2>Análisis</h2>
			{data ? (
				<CodeBox>{JSON.stringify(data.report, null, 2)}</CodeBox>
			) : (
				<p>No hay análisis disponibles.</p>
			)}
		</InfoSection>
	);
}
