import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Sensores from "./pages/Sensores"
import Mantenimientos from "./pages/Mantenimientos"
import Fallos from "./pages/Fallos"
import Usuarios from "./pages/Usuarios"
import Analisis from "./pages/Analisis"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sensores" element={<Sensores />} />
          <Route path="mantenimientos" element={<Mantenimientos />} />
          <Route path="fallos" element={<Fallos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="analisis" element={<Analisis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
