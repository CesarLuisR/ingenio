import type { Failure, Machine, Sensor } from "../../../types";
import useFailureForm from "../hooks/useFailureForm";

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

    // Sensores filtrados por la máquina seleccionada
    const filteredSensors = sensors.filter(
        (s) => Number(formData.machineId) === s.machineId
    );

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseIconButton onClick={onClose}>×</CloseIconButton>

                <ModalTitle>
                    {initialData ? "Editar Falla" : "Reportar Nueva Falla"}
                </ModalTitle>

                <Form onSubmit={handleSubmit}>
                    {/* 🔷 Máquina */}
                    <Field>
                        <Label>Máquina Afectada</Label>
                        <SelectInput
                            required
                            value={formData.machineId}
                            onChange={(e) => updateField("machineId", e.target.value)}
                        >
                            <option value="">Seleccionar máquina...</option>
                            {machines.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} {m.code ? `(${m.code})` : ""}
                                </option>
                            ))}
                        </SelectInput>
                    </Field>

                    {/* 🔶 Sensor (opcional pero filtrado por máquina) */}
                    <Field>
                        <Label>Sensor Relacionado (Opcional)</Label>
                        <SelectInput
                            value={formData.sensorId}
                            onChange={(e) => updateField("sensorId", e.target.value)}
                            disabled={!formData.machineId}
                        >
                            <option value="">Sin sensor específico</option>
                            {filteredSensors.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </SelectInput>
                        {!formData.machineId && (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Selecciona una máquina primero</span>
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