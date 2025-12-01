import { useMemo } from "react";
import type { Failure, Machine, Sensor } from "../../../types";
import useFailureForm from "../hooks/useFailureForm";
import SearchableSelect from "../../shared/components/SearchableSelect"; // Ajusta la ruta

import {
    ButtonGroup,
    CancelButton,
    CloseIconButton,
    Field,
    Form,
    Label,
    Modal,
    ModalContent,
    ModalTitle,
    SelectInput,
    SubmitButton,
    TextArea,
} from "../styled";

export default function FailureForm({
    machines,
    sensors,
    initialData,
    onClose,
    onSave,
}: {
    machines: Machine[];
    sensors: Sensor[];
    initialData?: Failure | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const { formData, updateField, handleSubmit } = useFailureForm(
        initialData ?? null,
        onSave
    );

    // Filtramos los sensores por la máquina seleccionada
    const filteredSensors = useMemo(() => {
        return sensors.filter(
            (s) => Number(formData.machineId) === s.machineId
        );
    }, [sensors, formData.machineId]);

    // Mapeo para SearchableSelect - Máquinas
    const machineOptions = useMemo(() => {
        return machines.map(m => ({ id: m.id, name: m.name, code: m.code || "" }));
    }, [machines]);

    // Mapeo para SearchableSelect - Sensores
    const sensorOptions = useMemo(() => {
        return filteredSensors.map(s => ({ id: s.id, name: s.name }));
    }, [filteredSensors]);

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseIconButton onClick={onClose}>×</CloseIconButton>

                <ModalTitle>
                    {initialData ? "Editar Falla" : "Reportar Nueva Falla"}
                </ModalTitle>

                <Form onSubmit={handleSubmit}>
                    {/* 🔷 Máquina con SearchableSelect */}
                    <Field>
                        <Label>Máquina Afectada</Label>
                        <div style={{ width: '100%' }}>
                            <SearchableSelect
                                options={machineOptions}
                                value={Number(formData.machineId) || 0}
                                onChange={(val) => updateField("machineId", val === 0 ? "" : val.toString())}
                                placeholder="Seleccionar máquina..."
                            />
                        </div>
                    </Field>

                    {/* 🔶 Sensor con SearchableSelect */}
                    <Field>
                        <Label>Sensor Relacionado (Opcional)</Label>
                        <div style={{ width: '100%' }}>
                            <SearchableSelect
                                options={sensorOptions}
                                value={Number(formData.sensorId) || 0}
                                onChange={(val) => updateField("sensorId", val === 0 ? "" : val.toString())}
                                placeholder={!formData.machineId ? "Selecciona una máquina primero" : "Sin sensor específico"}
                                disabled={!formData.machineId}
                            />
                        </div>
                        {!formData.machineId && (
                            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                                Selecciona una máquina primero
                            </span>
                        )}
                    </Field>

                    <Field>
                        <Label>Descripción del Problema</Label>
                        <TextArea
                            required
                            rows={4}
                            placeholder="Describe qué sucedió, ruidos extraños, lecturas anómalas..."
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field>
                            <Label>Nivel de Severidad</Label>
                            <SelectInput
                                value={formData.severity}
                                onChange={(e) => updateField("severity", e.target.value)}
                            >
                                <option value="Baja">🟢 Baja</option>
                                <option value="Media">🟡 Media</option>
                                <option value="Alta">🟠 Alta</option>
                                <option value="Crítica">🔴 Crítica</option>
                            </SelectInput>
                        </Field>

                        <Field>
                            <Label>Estado Actual</Label>
                            <SelectInput
                                value={formData.status}
                                onChange={(e) => updateField("status", e.target.value)}
                            >
                                <option value="pendiente">⏳ Pendiente</option>
                                <option value="en reparación">🔧 En reparación</option>
                                <option value="resuelta">✅ Resuelta</option>
                            </SelectInput>
                        </Field>
                    </div>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit">
                            {initialData ? "Guardar cambios" : "Reportar Falla"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </Modal>
    );
}