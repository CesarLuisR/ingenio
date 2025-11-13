import { BrowserRouter, Routes, Route } from "react-router-dom";
import Fallos from "./pages/Fallos";
import Usuarios from "./pages/Usuarios";
import Analisis from "./pages/Analisis";
import Dashboard from "./features/dashboard";
import Layout from "./features/shared/components/Layout";
import Sensores from "./features/sensors";
import SensorDetail from "./features/sensor-detail";
import Technicians from "./pages/Technician";
import Mantenimientos from "./features/maintenances";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Dashboard/>} />{" "}
					<Route path="/sensor/:id" element={<SensorDetail />} />
					<Route path="sensores" element={<Sensores/>} />
					<Route path="mantenimientos" element={<Mantenimientos />} />
					<Route path="fallos" element={<Fallos />} />
					<Route path="usuarios" element={<Usuarios />} />
					<Route path="analisis" element={<Analisis />} />
					<Route path="tecnicos" element={<Technicians />} />
					<Route path="*" element={<div>Página no encontrada</div>} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
