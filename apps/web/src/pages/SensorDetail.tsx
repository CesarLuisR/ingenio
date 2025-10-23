"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  api,
  type Reading,
  type MetricsMap,
  type Maintenance,
  type Failure,
  type AnalysisResponse,
} from "../lib/api"

const MAX_POINTS = 20

export default function SensorDetail() {
  const { id } = useParams<{ id: string }>()
  const [history, setHistory] = useState<Reading[]>([])
  const [sensorName, setSensorName] = useState<string>("")
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [failures, setFailures] = useState<Failure[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [chartData, setChartData] = useState<Record<string, any[]>>({})
  const wsRef = useRef<WebSocket | null>(null)

  // === cargar datos iniciales ===
  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const sensor = await api.getSensor(String(id))
        setSensorName(sensor.name)

        const [maints, fails, anal] = await Promise.all([
          api.getMaintenances(),
          api.getFailures(),
          api.analyzeData([String(id)]),
        ])

        setMaintenances(maints.filter((m) => m.sensorId === sensor.sensorId))
        setFailures(fails.filter((f) => f.sensorId === sensor.sensorId))
        setAnalysis(anal)
      } catch (err) {
        console.error("Error cargando datos base:", err)
      }
    }
    loadBaseData()
  }, [id])

  // === WebSocket ===
  useEffect(() => {
    const wsUrl =
      window.location.hostname === "localhost"
        ? "ws://localhost:5000/ws"
        : "ws://api:5000/ws"

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => console.log("✅ WebSocket conectado")
    ws.onerror = (err) => console.error("❌ WebSocket error:", err)

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        const reading = msg.payload || msg.data
        if (msg.type === "reading" && reading?.sensorId === id) {
          console.log("📡 Nueva lectura:", reading)
          setHistory((prev) => {
            const updated = [...prev, reading]
            return updated.slice(-MAX_POINTS)
          })
          updateChartData(reading)
        }
      } catch (e) {
        console.error("Error procesando WS:", e)
      }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [id])

  // === construcción incremental de data ===
  const updateChartData = (reading: Reading) => {
    setChartData((prev) => {
      const newData = { ...prev }
      const time = new Date(reading.timestamp).toLocaleTimeString()

      Object.entries(reading.metrics || {}).forEach(([category, metrics]) => {
        if (!newData[category]) newData[category] = []

        const newPoint: any = { time }
        Object.entries(metrics).forEach(([metric, val]) => {
          const value =
            typeof val === "object" && val !== null && "value" in val
              ? (val as any).value
              : val
          newPoint[metric] = value
        })

        newData[category] = [...newData[category], newPoint].slice(-MAX_POINTS)
      })

      return newData
    })
  }

  const latest = history[history.length - 1]
  const colors = [
    "#2563eb",
    "#dc2626",
    "#16a34a",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#0ea5e9",
    "#14b8a6",
  ]

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.75rem" }}>
        {sensorName || "Sensor"} ({id})
      </h1>

      {latest ? (
        <>
          {Object.entries(chartData).map(([category, data]) => (
            <div key={category} style={{ margin: "2rem 0" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                {category.toUpperCase()}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(latest.metrics[category] || {}).map(
                    (metric, i) => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={colors[i % colors.length]}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={500}
                        animationEasing="ease-in-out"
                      />
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}

          <section style={{ marginTop: "2rem" }}>
            <h2>Mantenimientos</h2>
            {maintenances.length > 0 ? (
              <ul>
                {maintenances.map((m) => (
                  <li key={m.id}>
                    <b>{m.status}</b> — {m.description}{" "}
                    ({new Date(m.scheduledDate).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay mantenimientos.</p>
            )}
          </section>

          <section style={{ marginTop: "2rem" }}>
            <h2>Fallas</h2>
            {failures.length > 0 ? (
              <ul>
                {failures.map((f) => (
                  <li key={f.id}>
                    <b>{f.severity}</b> — {f.description} ({f.status})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se han detectado fallas.</p>
            )}
          </section>

          <section style={{ marginTop: "2rem" }}>
            <h2>Análisis</h2>
            {analysis ? (
              <pre
                style={{
                  background: "#f9fafb",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                {JSON.stringify(analysis.report, null, 2)}
              </pre>
            ) : (
              <p>No hay análisis disponibles.</p>
            )}
          </section>

          <section style={{ marginTop: "2rem" }}>
            <h2>Última lectura</h2>
            <pre
              style={{
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "8px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(latest, null, 2)}
            </pre>
          </section>
        </>
      ) : (
        <p>Esperando lecturas...</p>
      )}
    </div>
  )
}
