"use client"

import { useEffect, useState, useRef } from "react"
import styled from "styled-components"
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
import { api, type Sensor } from "../lib/api"

interface MetricInfo {
  value: number
  status: "ok" | "low" | "high" | "unknown"
}

interface MetricsMap {
  [category: string]: { [metric: string]: MetricInfo | number }
}

interface Reading {
  sensorId: string
  timestamp: string
  status: "ok" | "warning" | "critical" | "unknown"
  metrics: MetricsMap
  // campos adicionales que podrían llegar:
  issues?: any[]
  totalIssues?: number
  severityLevel?: number
}

interface WSMessage {
  type: string
  payload?: Reading
  data?: Reading
}

const Container = styled.div`
  padding: 2rem;
  background-color: #f3f4f6;
  min-height: 100vh;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
`

const StatusText = styled.p<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => (props.$status === "connected" ? "#059669" : "#dc2626")};
`

const StatsCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`

const SensorSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`

const SensorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
`

const SensorTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const SensorStatus = styled.span<{ $status: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.$status === "active"
      ? "#d1fae5"
      : props.$status === "maintenance"
      ? "#fef3c7"
      : props.$status === "unknown"
      ? "#e5e7eb"
      : "#fee2e2"};
  color: ${(props) =>
    props.$status === "active"
      ? "#065f46"
      : props.$status === "maintenance"
      ? "#92400e"
      : props.$status === "unknown"
      ? "#374151"
      : "#991b1b"};
`

const ChartContainer = styled.div`
  margin: 20px 0;
  height: 300px;
`

const SensorInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`

const InfoItem = styled.div`
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
`

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 4px;
`

const InfoValue = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
`

const EmptyState = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.125rem;
`

// -------------------------
// UTIL
// -------------------------
const normalizeId = (id: string | number) => String(id).toLowerCase().trim()

// Coaccionar valor de métrica a número de forma segura
const toNumber = (v: unknown): number =>
  typeof v === "number" ? v : Number(v ?? NaN)

export default function Dashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [status, setStatus] = useState<"connecting" | "connected" | "closed">("connecting")
  const [sensorHistory, setSensorHistory] = useState<Record<string, Reading[]>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<number | null>(null)

  // 1) Cargar sensores desde la API (metadatos)
  useEffect(() => {
    const loadSensors = async () => {
      try {
        const data = await api.getSensors()
        const sanitized = (Array.isArray(data) ? data : []).map((s: any) => ({
          ...s,
          status: s.status ?? "unknown",
          id: s.id ?? s.sensorId ?? s.name ?? "unknown",
        }))
        console.log("🧭 Sensores de API:", sanitized)
        setSensors(sanitized)
      } catch (error) {
        console.error("Error cargando sensores:", error)
      }
    }
    loadSensors()
  }, [])

  // 2) WebSocket + reconexión con handlers
  useEffect(() => {
    const wsUrl =
      window.location.hostname === "localhost"
        ? "ws://localhost:5000/ws"
        : "ws://api:5000/ws"

    const connectWS = () => {
      if (wsRef.current) return
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("✅ WS conectado:", wsUrl)
        setStatus("connected")
        if (retryRef.current) {
          window.clearTimeout(retryRef.current)
          retryRef.current = null
        }
      }

      ws.onclose = () => {
        console.warn("⚠️ WS cerrado. Reintento en 3s…")
        setStatus("closed")
        wsRef.current = null
        if (!retryRef.current) {
          retryRef.current = window.setTimeout(() => {
            connectWS()
          }, 3000)
        }
      }

      ws.onerror = (err) => {
        console.warn("❌ WS error:", err)
      }

      ws.onmessage = (ev) => {
        try {
          const msg: WSMessage = JSON.parse(ev.data)
          const reading = msg.payload || msg.data
          if (msg.type === "reading" && reading) {
            console.log("📡 Reading recibida:", reading)
            const key = normalizeId(reading.sensorId)
            setSensorHistory((prev) => {
              const history = prev[key] || []
              const updated = [reading, ...history].slice(0, 100)
              console.log(`🧾 Historial(${key}) ->`, updated)
              return { ...prev, [key]: updated }
            })
          }
        } catch (err) {
          console.error("Error parseando mensaje WS:", err)
        }
      }
    }

    setStatus("connecting")
    connectWS()

    return () => {
      if (retryRef.current) {
        window.clearTimeout(retryRef.current)
        retryRef.current = null
      }
      // Mantén WS abierto en dev; ciérralo fuera de dev
      if (process.env.NODE_ENV !== "development" && wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  // 3) Preparar datos para Recharts
  const prepareChartData = (sensorId: string) => {
    const key = normalizeId(sensorId)
    const history = sensorHistory[key] || []

    // Genera puntos newest->oldest y luego reverse para X ascendente
    const data = history
      .slice()
      .reverse()
      .map((reading) => {
        const dataPoint: Record<string, number | string> = {
          time: new Date(reading.timestamp).toLocaleTimeString(),
        }
        const metrics = reading.metrics || {}
        Object.entries(metrics).forEach(([category, metricsObj]) => {
          Object.entries(metricsObj).forEach(([metric, info]) => {
            const v =
              typeof info === "object" && info !== null && "value" in (info as any)
                ? (info as MetricInfo).value
                : info
            const num = toNumber(v)
            if (!Number.isNaN(num)) {
              dataPoint[`${category}_${metric}`] = num
            }
          })
        })
        return dataPoint
      })

    console.log(`📈 chartData(${sensorId}):`, data)
    return data
  }

  // 4) Claves de métricas a graficar (de la última lectura)
  const getMetricKeys = (sensorId: string) => {
    const last = sensorHistory[normalizeId(sensorId)]?.[0]
    if (!last) return []
    const keys: string[] = []
    Object.entries(last.metrics || {}).forEach(([category, m]) => {
      Object.keys(m).forEach((metric) => keys.push(`${category}_${metric}`))
    })
    return keys
  }

  const getLatestReading = (sensorId: string) => sensorHistory[normalizeId(sensorId)]?.[0]

  const getStatusEmoji = (s: string) =>
    s === "critical" ? "🚨" : s === "warning" ? "⚠️" : s === "ok" ? "✅" : "❔"

  const connectionEmoji = status === "connected" ? "🟢" : status === "connecting" ? "🟡" : "🔴"

  // 5) Conjunto de sensores a renderizar: unión de API + WS
  const idsFromApi = sensors.map((s) => normalizeId(s.id ?? s.sensorId ?? s.name ?? "unknown"))
  const idsFromWs = Object.keys(sensorHistory)
  const idsSet = new Set([...idsFromApi, ...idsFromWs].filter(Boolean))
  const allToRender = Array.from(idsSet)

  // Mapa auxiliar para metadatos
  const sensorMeta: Record<string, Partial<Sensor>> = {}
  sensors.forEach((s) => {
    sensorMeta[normalizeId(s.id ?? s.sensorId ?? s.name ?? "unknown")] = s
  })

  return (
    <Container>
      <Header>
        <div>
          <Title>Dashboard en Tiempo Real</Title>
          <StatusText $status={status}>
            {connectionEmoji}{" "}
            {status === "connected"
              ? "Conectado al servidor"
              : status === "connecting"
              ? "Conectando..."
              : "Desconectado"}
          </StatusText>
        </div>
        <StatsCard>{allToRender.length} sensores activos</StatsCard>
      </Header>

      {allToRender.length === 0 ? (
        <EmptyState>Esperando lecturas o sensores registrados…</EmptyState>
      ) : (
        allToRender.map((id) => {
          const meta = sensorMeta[id] || {}
          const chartData = prepareChartData(id)
          const metricKeys = getMetricKeys(id)
          const latestReading = getLatestReading(id)
          const colors = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899", "#0ea5e9", "#10b981"]

          const visibleName =
            (meta as any)?.name ??
            (meta as any)?.id ??
            id

          // Estado de tarjeta: usa meta.status si existe, sino "unknown"
          const cardStatus = ((meta as any)?.status as string) ?? "unknown"

          return (
            <SensorSection key={id}>
              <SensorHeader>
                <SensorTitle>
                  {visibleName} ({id})
                </SensorTitle>
                <SensorStatus $status={cardStatus}>
                  {String(cardStatus).toUpperCase()}
                </SensorStatus>
              </SensorHeader>

              {chartData.length > 0 && metricKeys.length > 0 ? (
                <>
                  <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {metricKeys.map((mKey, idx) => (
                          <Line
                            key={mKey}
                            type="monotone"
                            dataKey={mKey}
                            stroke={colors[idx % colors.length]}
                            name={mKey.replace(/_/g, " ")}
                            dot={false}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <SensorInfo>
                    <InfoItem>
                      <InfoLabel>Tipo</InfoLabel>
                      <InfoValue>{(meta as any)?.type ?? "—"}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Ubicación</InfoLabel>
                      <InfoValue>{(meta as any)?.location ?? "—"}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Estado Actual</InfoLabel>
                      <InfoValue>
                        {latestReading ? (
                          <>
                            {getStatusEmoji(latestReading.status)} {latestReading.status.toUpperCase()}
                          </>
                        ) : (
                          "Sin datos"
                        )}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Última Lectura</InfoLabel>
                      <InfoValue>
                        {latestReading ? new Date(latestReading.timestamp).toLocaleString() : "N/A"}
                      </InfoValue>
                    </InfoItem>
                  </SensorInfo>
                </>
              ) : (
                <EmptyState>Esperando datos del sensor…</EmptyState>
              )}
            </SensorSection>
          )
        })
      )}
    </Container>
  )
}
