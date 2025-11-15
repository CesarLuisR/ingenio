import { BrowserRouter, Routes, Route } from "react-router-dom";
import Usuarios from "./pages/Usuarios";
import Analisis from "./pages/Analisis";
import Dashboard from "./features/dashboard";
import Layout from "./features/shared/components/Layout";
import Sensores from "./features/sensors";
import SensorDetail from "./features/sensor-detail";
import Mantenimientos from "./features/maintenances";
import Fallos from "./features/failures";
import Technicians from "./features/technicians";
import LoginModule from "./features/auth";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* login no está protegido */}
				<Route path="/login" element={<LoginModule />} />

				{/* todo lo demás sí */}
				<Route element={<ProtectedRoute />}>
					<Route path="/" element={<Layout />}>
						<Route index element={<Dashboard />} />
						<Route path="sensor/:id" element={<SensorDetail />} />
						<Route path="sensores" element={<Sensores />} />
						<Route path="mantenimientos" element={<Mantenimientos />} />
						<Route path="fallos" element={<Fallos />} />
						<Route path="usuarios" element={<Usuarios />} />
						<Route path="analisis" element={<Analisis />} />
						<Route path="tecnicos" element={<Technicians />} />
						<Route path="*" element={<div>Página no encontrada</div>} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
