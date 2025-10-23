"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { api, type Maintenance, type Sensor } from "../lib/api"

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
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`

const MaintenanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const MaintenanceCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #e5e7eb;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`

const SensorName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "completed" ? "#dcfce7" : props.status === "in_progress" ? "#dbeafe" : "#fef3c7"};
  color: ${(props) => (props.status === "completed" ? "#15803d" : props.status === "in_progress" ? "#1e40af" : "#a16207")};
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

const Input = styled.input`
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
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`

export default function Mantenimientos() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [maintenancesData, sensorsData] = await Promise.all([api.getMaintenances(), api.getSensors()])
      setMaintenances(maintenancesData)
      setSensors(sensorsData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingText>Cargando mantenimientos...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>Mantenimientos</Title>
        <Button onClick={() => setShowForm(true)}>+ Programar Mantenimiento</Button>
      </Header>

      <MaintenanceList>
        {maintenances.map((maintenance) => {
          const sensor = sensors.find((s) => s.id === maintenance.sensorId)
          return (
            <MaintenanceCard key={maintenance.id}>
              <CardHeader>
                <SensorName>{sensor?.name || maintenance.sensorId}</SensorName>
                <StatusBadge status={maintenance.status}>
                  {maintenance.status === "completed"
                    ? "Completado"
                    : maintenance.status === "in_progress"
                      ? "En Progreso"
                      : "Pendiente"}
                </StatusBadge>
              </CardHeader>

              <Description>{maintenance.description}</Description>

              <InfoList>
                <p>📅 Programado: {new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
                {maintenance.completedDate && (
                  <p>✅ Completado: {new Date(maintenance.completedDate).toLocaleDateString()}</p>
                )}
                {maintenance.technician && <p>👤 Técnico: {maintenance.technician}</p>}
                {maintenance.notes && <p>📝 Notas: {maintenance.notes}</p>}
              </InfoList>
            </MaintenanceCard>
          )
        })}
      </MaintenanceList>

      {showForm && (
        <MaintenanceForm
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

function MaintenanceForm({ sensors, onClose, onSave }: { sensors: Sensor[]; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    sensorId: "",
    description: "",
    scheduledDate: "",
    technician: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createMaintenance(formData)
      onSave()
    } catch (error) {
      console.error("Error creando mantenimiento:", error)
    }
  }

  return (
    <Modal>
      <ModalContent>
        <ModalTitle>Programar Mantenimiento</ModalTitle>

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
            <Label>Fecha Programada</Label>
            <Input
              type="date"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Técnico</Label>
            <Input
              type="text"
              value={formData.technician}
              onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Notas</Label>
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
            <SubmitButton type="submit">Guardar</SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  )
}
