import { useState, useMemo } from "react";
import { api } from "../../../lib/api"; 
import type { Machine } from "../../../types";
import SearchableSelect from "../../shared/components/SearchableSelect"; // Ajusta la ruta

import {
  Modal,
  ModalContent,
  ModalTitle,
  Form,
  FormGroup,
  Label,
  Input,
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
  // SearchableSelect devuelve un número, usamos 0 o undefined para "vacío"
  const [selectedMachineId, setSelectedMachineId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Mapeamos las máquinas al formato de SearchableSelect
  const machineOptions = useMemo(() => {
    return machines.map(m => ({
        id: m.id,
        name: m.name,
        code: m.code ?? ""
    }));
  }, [machines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sensorId || !selectedMachineId) return;

    setLoading(true);
    try {
      const machine = machines.find(m => m.id === selectedMachineId);
      
      if (!machine) throw new Error("Máquina no válida");

      await api.createSensor({
        sensorId: sensorId,
        machineId: machine.id,
        ingenioId: machine.ingenioId 
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creando sensor:", error);
      alert("Error al crear el sensor.");
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
            {/* Reemplazo por SearchableSelect */}
            <div style={{ width: '100%' }}>
                <SearchableSelect 
                    options={machineOptions}
                    value={selectedMachineId || 0} // 0 indica no seleccionado si ID no existe
                    onChange={(val) => setSelectedMachineId(val)}
                    placeholder="-- Selecciona una máquina --"
                />
            </div>
            
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              El sensor se creará como "NOCONFIGURADO" hasta que se editen sus detalles.
            </p>
          </FormGroup>

          <ModalActions>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </CancelButton>
            {/* Validamos que selectedMachineId tenga valor */}
            <SubmitButton type="submit" disabled={loading || !sensorId || !selectedMachineId}>
              {loading ? "Creando..." : "Crear Sensor"}
            </SubmitButton>
          </ModalActions>
        </Form>
      </ModalContent>
    </Modal>
  );
}