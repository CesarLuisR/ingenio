import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sensores from "./pages/Sensores";
import Mantenimientos from "./pages/Mantenimientos";
import Fallos from "./pages/Fallos";
import Usuarios from "./pages/Usuarios";
import Analisis from "./pages/Analisis";
import Dashboard from "./features/dashboard";
import Layout from "./features/shared/components/Layout";
import SensorDetail from "./pages/SensorDetail";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Dashboard/>} />{" "}
					<Route path="/sensor/:id" element={<SensorDetail/>} />
					<Route path="sensores" element={<Sensores />} />
					<Route path="mantenimientos" element={<Mantenimientos />} />
					<Route path="fallos" element={<Fallos />} />
					<Route path="usuarios" element={<Usuarios />} />
					<Route path="analisis" element={<Analisis />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
