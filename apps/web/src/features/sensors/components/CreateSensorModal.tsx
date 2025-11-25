import { useState } from "react";
import { api } from "../../../lib/api"; // Ajusta la ruta a tu api
import type { Machine } from "../../../types";
import {
  Modal,
  ModalContent,
  ModalTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Select,
  ModalActions,
  CancelButton,
  SubmitButton
} from "../styled";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  machines: Machine[];
}

export default function CreateSensorModal({ onClose, onSuccess, machines }: Props) {
  const [sensorId, setSensorId] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState<number | string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sensorId || !selectedMachineId) return;

    setLoading(true);
    try {
      // Buscamos la máquina para obtener su ingenioId automáticamente
      const machine = machines.find(m => m.id === Number(selectedMachineId));
      
      if (!machine) throw new Error("Máquina no válida");

      await api.createSensor({
        sensorId: sensorId,
        machineId: machine.id,
        ingenioId: machine.ingenioId // Asumimos que la máquina tiene este dato
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creando sensor:", error);
      alert("Error al crear el sensor. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Nuevo Sensor</ModalTitle>
        <Form onSubmit={handleSubmit}>
          
          <FormGroup>
            <Label>ID del Sensor (Único)</Label>
            <Input 
              autoFocus
              placeholder="Ej: SN-2024-001"
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Asignar a Máquina</Label>
            <Select 
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              required
              style={{ width: '100%' }}
            >
              <option value="">-- Selecciona una máquina --</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.code ? `(${m.code})` : ''}
                </option>
              ))}
            </Select>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              El sensor se creará como "NOCONFIGURADO" hasta que se editen sus detalles.
            </p>
          </FormGroup>

          <ModalActions>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={loading || !sensorId || !selectedMachineId}>
              {loading ? "Creando..." : "Crear Sensor"}
            </SubmitButton>
          </ModalActions>
        </Form>
      </ModalContent>
    </Modal>
  );
}