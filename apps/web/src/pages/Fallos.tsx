"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { api, type Failure, type Sensor } from "../lib/api"

const Container = styled.div`
  padding: 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin: 0;
`

const Button = styled.button`
  padding: 10px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #b91c1c;
  }
`

const FailureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FailureCard = styled.div<{ severity: string }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-left: 4px solid
    ${(props) =>
      props.severity === "critical"
        ? "#dc2626"
        : props.severity === "high"
          ? "#f97316"
          : props.severity === "medium"
            ? "#eab308"
            : "#3b82f6"};
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`

const SensorName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const SeverityBadge = styled.span<{ severity: string }>`
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

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "resolved" ? "#dcfce7" : props.status === "in_progress" ? "#dbeafe" : "#f3f4f6"};
  color: ${(props) => (props.status === "resolved" ? "#15803d" : props.status === "in_progress" ? "#1e40af" : "#374151")};
`

const Description = styled.p`
  color: #374151;
  margin: 8px 0;
`

const InfoList = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
  }
`

const LoadingText = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
`

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 448px;
  width: 100%;
  padding: 24px;
`

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #111827;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 16px;
`

const CancelButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`

const SubmitButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #b91c1c;
  }
`

export default function Fallos() {
  const [failures, setFailures] = useState<Failure[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [failuresData, sensorsData] = await Promise.all([api.getFailures(), api.getSensors()])
      setFailures(failuresData)
      setSensors(sensorsData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingText>Cargando fallos...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>Registro de Fallos</Title>
        <Button onClick={() => setShowForm(true)}>+ Reportar Fallo</Button>
      </Header>

      <FailureList>
        {failures.map((failure) => {
          const sensor = sensors.find((s) => s.id === failure.sensorId)
          return (
            <FailureCard key={failure.id} severity={failure.severity}>
              <CardHeader>
                <SensorName>{sensor?.name || failure.sensorId}</SensorName>
                <SeverityBadge severity={failure.severity}>
                  {failure.severity === "critical"
                    ? "Crítico"
                    : failure.severity === "high"
                      ? "Alto"
                      : failure.severity === "medium"
                        ? "Medio"
                        : "Bajo"}
                </SeverityBadge>
                <StatusBadge status={failure.status}>
                  {failure.status === "resolved"
                    ? "Resuelto"
                    : failure.status === "in_progress"
                      ? "En Progreso"
                      : "Abierto"}
                </StatusBadge>
              </CardHeader>

              <Description>{failure.description}</Description>

              <InfoList>
                <p>🕐 Detectado: {new Date(failure.detectedAt).toLocaleString()}</p>
                {failure.resolvedAt && <p>✅ Resuelto: {new Date(failure.resolvedAt).toLocaleString()}</p>}
                {failure.notes && <p>📝 Notas: {failure.notes}</p>}
              </InfoList>
            </FailureCard>
          )
        })}
      </FailureList>

      {showForm && (
        <FailureForm
          sensors={sensors}
          onClose={() => setShowForm(false)}
          onSave={() => {
            loadData()
            setShowForm(false)
          }}
        />
      )}
    </Container>
  )
}

function FailureForm({ sensors, onClose, onSave }: { sensors: Sensor[]; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    sensorId: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createFailure({
        ...formData,
        detectedAt: new Date().toISOString(),
        status: "open",
      })
      onSave()
    } catch (error) {
      console.error("Error reportando fallo:", error)
    }
  }

  return (
    <Modal>
      <ModalContent>
        <ModalTitle>Reportar Fallo</ModalTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Sensor</Label>
            <Select
              required
              value={formData.sensorId}
              onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
            >
              <option value="">Seleccionar sensor</option>
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Descripción</Label>
            <TextArea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <Label>Severidad</Label>
            <Select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Notas Adicionales</Label>
            <TextArea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit">Reportar</SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  )
}
