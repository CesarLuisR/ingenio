"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { api, type AnalysisResponse, type Sensor } from "../lib/api"

const Container = styled.div`
  padding: 0;
`

const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin: 0 0 24px 0;
`

const FormCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Input = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const Button = styled.button`
  padding: 10px 24px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Section = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`

const TrendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TrendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
`

const TrendMetric = styled.span`
  font-weight: 500;
  color: #374151;
`

const TrendValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TrendArrow = styled.span<{ direction: string }>`
  font-size: 18px;
  color: ${(props) => (props.direction === "up" ? "#16a34a" : props.direction === "down" ? "#dc2626" : "#6b7280")};
`

const TrendChange = styled.span`
  font-weight: 600;
`

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const AlertItem = styled.div<{ severity: string }>`
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid
    ${(props) =>
      props.severity === "critical"
        ? "#dc2626"
        : props.severity === "high"
          ? "#f97316"
          : props.severity === "medium"
            ? "#eab308"
            : "#3b82f6"};
  background-color: ${(props) =>
    props.severity === "critical"
      ? "#fef2f2"
      : props.severity === "high"
        ? "#fff7ed"
        : props.severity === "medium"
          ? "#fefce8"
          : "#eff6ff"};
`

const AlertHeader = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 4px;
`

const AlertType = styled.span`
  font-weight: 600;
  color: #111827;
`

const AlertBadge = styled.span<{ severity: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.severity === "critical"
      ? "#fee2e2"
      : props.severity === "high"
        ? "#ffedd5"
        : props.severity === "medium"
          ? "#fef3c7"
          : "#dbeafe"};
  color: ${(props) =>
    props.severity === "critical"
      ? "#991b1b"
      : props.severity === "high"
        ? "#9a3412"
        : props.severity === "medium"
          ? "#a16207"
          : "#1e40af"};
`

const AlertMessage = styled.p`
  font-size: 14px;
  color: #374151;
  margin: 4px 0 0 0;
`

const PredictionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PredictionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
`

const PredictionMetric = styled.span`
  font-weight: 500;
  color: #374151;
`

const PredictionValue = styled.div`
  text-align: right;
`

const PredictionNumber = styled.div`
  font-weight: 600;
  color: #111827;
`

const PredictionConfidence = styled.div`
  font-size: 12px;
  color: #6b7280;
`

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`

const Checkbox = styled.input`
  cursor: pointer;
`

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 16px;
`

const MetricCard = styled.div`
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
`

const MetricName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`

const MetricDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  font-size: 0.875rem;
`

const MetricDetail = styled.div`
  color: #374151;
`

const MetricLabel = styled.span`
  color: #6b7280;
`

const UrgencyBadge = styled.span<{ $urgency: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.$urgency.includes("fuera de rango")
      ? "#fee2e2"
      : props.$urgency.includes("muy alta")
        ? "#ffedd5"
        : props.$urgency === "moderada"
          ? "#fef3c7"
          : "#d1fae5"};
  color: ${(props) =>
    props.$urgency.includes("fuera de rango")
      ? "#991b1b"
      : props.$urgency.includes("muy alta")
        ? "#9a3412"
        : props.$urgency === "moderada"
          ? "#92400e"
          : "#065f46"};
`

export default function Analisis() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [selectedSensors, setSelectedSensors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)

  useEffect(() => {
    const loadSensors = async () => {
      try {
        const data = await api.getSensors()
        setSensors(data)
      } catch (error) {
        console.error("[v0] Error cargando sensores:", error)
      }
    }
    loadSensors()
  }, [])

  const handleSensorToggle = (sensorId: string) => {
    setSelectedSensors((prev) => (prev.includes(sensorId) ? prev.filter((id) => id !== sensorId) : [...prev, sensorId]))
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSensors.length === 0) {
      alert("Selecciona al menos un sensor")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Enviando análisis para sensores:", selectedSensors)
      const data = await api.analyzeData(selectedSensors)
      console.log("[v0] Resultado del análisis:", data)
      setResult(data)
    } catch (error) {
      console.error("[v0] Error analizando datos:", error)
      alert("Error al analizar los datos. Verifica la consola.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Title>Análisis de Datos</Title>

      <FormCard>
        <Form onSubmit={handleAnalyze}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#374151" }}>
              Selecciona los sensores a analizar:
            </h3>
            <CheckboxGroup>
              {sensors.map((sensor) => (
                <CheckboxLabel key={sensor.id}>
                  <Checkbox
                    type="checkbox"
                    checked={selectedSensors.includes(sensor.id)}
                    onChange={() => handleSensorToggle(sensor.id)}
                  />
                  {sensor.name} ({sensor.id})
                </CheckboxLabel>
              ))}
            </CheckboxGroup>
          </div>
          <Button type="submit" disabled={loading || selectedSensors.length === 0}>
            {loading ? "Analizando..." : "Analizar Sensores"}
          </Button>
        </Form>
      </FormCard>

      {result && (
        <ResultsContainer>
          {result.report.map((sensorReport) => (
            <Section key={sensorReport.sensorId}>
              <SectionTitle>📊 Sensor: {sensorReport.sensorId}</SectionTitle>

              {Object.entries(sensorReport.resumen).map(([category, metrics]) => (
                <div key={category} style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: "#111827", marginBottom: "12px" }}>{category.toUpperCase()}</h3>
                  {Object.entries(metrics).map(([metricName, analysis]: [string, any]) => {
                    if (analysis.message) {
                      return (
                        <MetricCard key={metricName}>
                          <MetricName>{metricName}</MetricName>
                          <div style={{ color: "#6b7280" }}>{analysis.message}</div>
                        </MetricCard>
                      )
                    }

                    return (
                      <MetricCard key={metricName}>
                        <MetricName>{metricName}</MetricName>
                        <MetricDetails>
                          <MetricDetail>
                            <MetricLabel>Tendencia:</MetricLabel> {analysis.tendencia}{" "}
                            {analysis.tendencia === "subiendo" ? "📈" : analysis.tendencia === "bajando" ? "📉" : "➡️"}
                          </MetricDetail>
                          <MetricDetail>
                            <MetricLabel>Valor Actual:</MetricLabel> {analysis.valorActual?.toFixed(2)}
                          </MetricDetail>
                          <MetricDetail>
                            <MetricLabel>Pendiente:</MetricLabel> {analysis.pendiente?.toExponential(2)}
                          </MetricDetail>
                          <MetricDetail>
                            <MetricLabel>Urgencia:</MetricLabel>{" "}
                            <UrgencyBadge $urgency={analysis.urgencia}>{analysis.urgencia}</UrgencyBadge>
                          </MetricDetail>
                        </MetricDetails>
                      </MetricCard>
                    )
                  })}
                </div>
              ))}

              {sensorReport.chartData &&
                Object.entries(sensorReport.chartData).map(([category, chartMetrics]) => (
                  <div key={category} style={{ marginTop: "24px" }}>
                    <h3 style={{ color: "#111827", marginBottom: "12px" }}>Gráficas - {category.toUpperCase()}</h3>
                    {chartMetrics.map((chartMetric) => (
                      <div key={chartMetric.metric}>
                        <h4 style={{ color: "#374151", marginBottom: "8px" }}>{chartMetric.metric}</h4>
                        <ChartContainer>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartMetric.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="timestamp"
                                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                              />
                              <YAxis />
                              <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                              <Legend />
                              <Line type="monotone" dataKey="value" stroke="#2563eb" name={chartMetric.metric} />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    ))}
                  </div>
                ))}
            </Section>
          ))}
        </ResultsContainer>
      )}
    </Container>
  )
}
