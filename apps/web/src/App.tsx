import { useEffect, useState } from "react";

interface Reading {
	sensorId: string;
	value: number;
	unit: string;
	ts: string;
	seq: number;
}

function App() {
	const [readings, setReadings] = useState<Reading[]>([]);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:5000/ws");

		ws.onopen = () => console.log("Conectado al WebSocket");
		ws.onclose = () => console.log("Conexion cerrada");
		ws.onerror = (e) => console.error("Error WS: ", e);

		ws.onmessage = (ev) => {
			const data = JSON.parse(ev.data);
			if (data.type === "reading") {
				setReadings((prev) => [data, ...prev.slice(0, 50)]);
			}
		};

		return () => {
			ws.close();
		};
	}, []);

	return (
		<main style={{ fontFamily: "sans-serif", padding: 16 }}>
			<h2>Lecturas en tiempo real</h2>
			<ul>
				{readings.map((r, i) => (
					<li key={i}>
						<strong>{r.sensorId}</strong> → {r.value} {r.unit} at{" "}
						{new Date(r.ts).toLocaleTimeString()}
					</li>
				))}
			</ul>
		</main>
	);
}

export default App;
