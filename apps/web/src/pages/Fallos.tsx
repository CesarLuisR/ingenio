import type React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { type Failure, type Sensor } from "../types";
import { api } from "../lib/api";

// === ESTILOS ===

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin: 0;
`;

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
`;

const FailureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FailureCard = styled.div<{ severity: string }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-left: 4px solid
    ${(props) =>
      props.severity === "Crítica"
        ? "#dc2626"
        : props.severity === "Alta"
        ? "#f97316"
        : props.severity === "Media"
        ? "#eab308"
        : "#3b82f6"};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const SensorName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.severity === "Crítica"
      ? "#fee2e2"
      : props.severity === "Alta"
      ? "#ffedd5"
      : props.severity === "Media"
      ? "#fef3c7"
      : "#dbeafe"};
  color: ${(props) =>
    props.severity === "Crítica"
      ? "#991b1b"
      : props.severity === "Alta"
      ? "#9a3412"
      : props.severity === "Media"
      ? "#a16207"
      : "#1e40af"};
`;

const CloseIconButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "resuelta"
      ? "#dcfce7"
      : props.status === "en reparación"
      ? "#dbeafe"
      : "#fef9c3"};
  color: ${(props) =>
    props.status === "resuelta"
      ? "#15803d"
      : props.status === "en reparación"
      ? "#1e40af"
      : "#a16207"};
`;

const Description = styled.p`
  color: #374151;
  margin: 8px 0;
`;

const InfoList = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 4px;
  p {
    margin: 0;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 448px;
  width: 100%;
  padding: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #111827;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 16px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: #b91c1c;
  }
`;

// === COMPONENTE PRINCIPAL ===
export default function Fallos() {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [failuresData, sensorsData] = await Promise.all([
        api.getFailures(),
        api.getSensors(),
      ]);
      setFailures(failuresData);
      setSensors(sensorsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingText>Cargando fallos...</LoadingText>;

  return (
    <Container>
      <Header>
        <Title>Registro de Fallos</Title>
        <Button onClick={() => setShowForm(true)}>+ Reportar Fallo</Button>
      </Header>

      <FailureList>
        {failures.map((failure) => {
          const sensor = sensors.find((s) => s.id === failure.sensorId);
          return (
            <FailureCard key={failure.id} severity={failure.severity || "Media"}>
              <CardHeader>
                <SensorName>{sensor?.name || `Sensor ${failure.sensorId}`}</SensorName>
                <SeverityBadge severity={failure.severity || "Media"}>
                  {failure.severity || "Media"}
                </SeverityBadge>
                <StatusBadge status={failure.status || "pendiente"}>
                  {failure.status}
                </StatusBadge>
              </CardHeader>

              <Description>{failure.description}</Description>

              <InfoList>
                <p>🕐 Detectado: {new Date(failure.occurredAt).toLocaleString()}</p>
                {failure.resolvedAt && (
                  <p>✅ Resuelto: {new Date(failure.resolvedAt).toLocaleString()}</p>
                )}
              </InfoList>
            </FailureCard>
          );
        })}
      </FailureList>

      {showForm && (
        <FailureForm
          sensors={sensors}
          onClose={() => setShowForm(false)}
          onSave={() => {
            loadData();
            setShowForm(false);
          }}
        />
      )}
    </Container>
  );
}

// === FORMULARIO MODAL ===
function FailureForm({ sensors, onClose, onSave }: {
  sensors: Sensor[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    sensorId: "",
    description: "",
    severity: "Media",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFailure({
        sensorId: Number(formData.sensorId),
        description: formData.description,
        severity: formData.severity,
        status: "pendiente",
      });
      onSave();
    } catch (error) {
      console.error("Error reportando fallo:", error);
    }
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        
        <CloseIconButton onClick={onClose}>×</CloseIconButton>

        <ModalTitle>Reportar Fallo</ModalTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Sensor</Label>
            <Select
              required
              value={formData.sensorId}
              onChange={(e) =>
                setFormData({ ...formData, sensorId: e.target.value })
              }
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
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </FormGroup>

          <FormGroup>
            <Label>Severidad</Label>
            <Select
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: e.target.value })
              }
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </Select>
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
  );
}
