import { useParams } from "react-router-dom";
import { Page } from "./styled";
import { useSensorDetail } from "./hooks/useSensorDetail";
import { SensorHeader } from "./components/SensorHeader";
import { SensorCharts } from "./components/SensorChart";
import { SensorMaintenances } from "./components/SensorMaintenances";
import { SensorFailures } from "./components/SensorFailures";
import { SensorMetrics } from "./components/SensorMetrics";
// import { SensorAnalysis } from "./components/SensorAnalysis";

export default function SensorDetail() {
	const { id } = useParams<{ id: string }>();
	const {
		sensorName,
		maintenances,
		failures,
		/*analysis,*/
		latest,
		chartData,
		sensorIntId,
	} = useSensorDetail(id);

	return (
		<Page>
			<SensorHeader name={sensorName} id={id} status={latest?.status} />

			{latest ? (
				<SensorCharts chartData={chartData} latest={latest} />
			) : (
				<p>Esperando lecturas...</p>
			)}

			<SensorMetrics sensorId={sensorIntId} />
			<SensorMaintenances items={maintenances} />
			<SensorFailures items={failures} />
			{/* <SensorAnalysis data={analysis} /> */}
		</Page>
	);
}
