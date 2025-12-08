import { BrowserRouter, Routes, Route } from "react-router-dom";
import Analisis from "./features/analysis";
import Dashboard from "./features/dashboard";
import Layout from "./context/Layout";
import Sensores from "./features/sensors";
import SensorDetail from "./features/sensor-detail";
import Mantenimientos from "./features/maintenances";
import Fallos from "./features/failures";
import Technicians from "./features/technicians";
import LoginModule from "./features/auth";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { GlobalWebSocketProvider } from "./context/WebSocketProvider";
import Usuarios from "./features/users";
import MachinesPage from "./features/machines";
import MachineDetailPage from "./features/machines/MachineDetailPage";
import Ingenios from "./features/ingenios";
import { AppThemeProvider } from "./context/ThemeContext";
import ReportsPage from "./features/reports";
import AuditPage from "./features/auditLogs";

export default function App() {
	return (
		<BrowserRouter>
			<AppThemeProvider>
				<GlobalWebSocketProvider>
					<Routes>
						{/* login no está protegido */}
						<Route path="/login" element={<LoginModule />} />

						{/* todo lo demás sí */}
						<Route element={<ProtectedRoute />}>
							<Route path="/" element={<Layout />}>
								<Route index element={<Dashboard />} />
								<Route
									path="sensor/:id"
									element={<SensorDetail />}
								/>
								<Route path="maquinas" element={<MachinesPage />} />
								<Route path="maquinas/:id" element={<MachineDetailPage />} />
								<Route path="usuarios" element={<Usuarios />} />
								<Route path="sensores" element={<Sensores />} />
								<Route
									path="mantenimientos"
									element={<Mantenimientos />}
								/>
								<Route path="fallos" element={<Fallos />} />
								<Route path="analisis" element={<Analisis />} />
								<Route path="tecnicos" element={<Technicians />} />
								<Route path="ingenios" element={<Ingenios />} />
								<Route path="reportes" element={<ReportsPage /> } />
								<Route path="historial" element={<AuditPage /> } />
								<Route
									path="*"
									element={<div>Página no encontrada</div>}
								/>
							</Route>
						</Route>
					</Routes>
				</GlobalWebSocketProvider>
			</AppThemeProvider>
		</BrowserRouter>
	);
}
