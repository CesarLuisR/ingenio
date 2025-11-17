import { useReadingsStore } from "../../store/readingState";
import { useDashboardStatus } from "./hooks/useDashboardStatus";
import { SensorCard } from "./components/SensorCard";
import { Container, Empty, Grid, Title } from "./styled";

export default function Dashboard() {
	const sensorMap = useReadingsStore((s) => s.sensorMap);

	const status = useDashboardStatus();

	const sensorsArray = Array.from(sensorMap.values())
		.map((readings) => readings[readings.length - 1])
		.filter(Boolean);

	return (
		<Container>
			<Title>
				Dashboard en Tiempo Real{" "}
				{status === "connected"
					? "🟢"
					: status === "connecting"
					? "🟡"
					: "🔴"}
			</Title>

			{sensorsArray.length === 0 ? (
				<Empty>Esperando lecturas de sensores conectados...</Empty>
			) : (
				<Grid>
					{sensorsArray.map((reading) => (
						<SensorCard key={reading.sensorId} reading={reading} />
					))}
				</Grid>
			)}
		</Container>
	);
}
