import type { Maintenance, Machine, Technician, Failure } from "../../../types";
import { useMaintenanceForm } from "../hooks/useMaintenanceForm";

import {
    ButtonGroup,
    CancelButton,
    CloseIconButton,
    EmptyState,
    ErrorText,
    FailureItem,
    FailuresList,
    Field,
    Form,
    FormRow,
    Label,
    Modal,
    ModalContent,
    ModalTitle,
    NumberInput,
    SelectInput,
    SubmitButton,
    TextArea,
    TextInput,
    // Asumiendo que tienes un Checkbox o similar en styled, si no, usa input standard
    // CheckboxInput 
} from "../styled";

export default function MaintenanceForm({
    machines,
    technicians,
    failures, // RECIBIMOS TODAS LAS FALLAS (o al menos las activas)
    initialData,
    onClose,
    onSave,
}: {
    machines: Machine[];
    technicians: Technician[];
    failures: Failure[]; // Nueva prop
    initialData?: (Maintenance & { failures?: Failure[] }) | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const { formData, errors, handleFieldChange, handleFailureToggle, handleSubmit } =
        useMaintenanceForm(initialData ?? null, onSave);

    // Filtramos las fallas relevantes:
    // 1. Deben pertenecer a la máquina seleccionada.
    // 2. Deben estar pendientes O ser parte del mantenimiento que estamos editando.
    const relevantFailures = failures.filter(f => {
        const isForSelectedMachine = f.machineId.toString() === formData.machineId;
        const isAlreadyLinked = initialData?.failures?.some(linked => linked.id === f.id);
        
        // Mostrar si es de la máquina Y (está pendiente O ya estaba vinculada)
        // Asumiendo que 'status' !== 'resuelto' significa pendiente, ajusta según tu lógica
        return isForSelectedMachine && (f.status !== 'resuelto' || isAlreadyLinked);
    });

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseIconButton aria-label="Cerrar" onClick={onClose}>
                    ×
                </CloseIconButton>

                <ModalTitle>
                    {initialData ? "Editar Mantenimiento" : "Registrar Mantenimiento"}
                </ModalTitle>

                <Form onSubmit={handleSubmit}>
                    <Field>
                        <Label>Máquina</Label>
                        <SelectInput
                            required
                            value={formData.machineId}
                            onChange={handleFieldChange("machineId")}
                        >
                            <option value="">Seleccionar máquina</option>
                            {machines.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} {m.code ? `(${m.code})` : ""}
                                </option>
                            ))}
                        </SelectInput>
                        {errors.machineId && <ErrorText>{errors.machineId}</ErrorText>}
                    </Field>

                    {/* SECCIÓN DE FALLAS */}
                    {formData.machineId && (
                        <Field>
                            <Label>Fallas Asociadas (Seleccionar para vincular)</Label>
                            <FailuresList>
                                {relevantFailures.length === 0 ? (
                                    <EmptyState>No hay fallas pendientes para esta máquina.</EmptyState>
                                ) : (
                                    relevantFailures.map((f) => (
                                        <FailureItem key={f.id}>
                                            <input
                                                type="checkbox"
                                                checked={formData.failureIds.includes(f.id.toString())}
                                                onChange={() => handleFailureToggle(f.id.toString())}
                                            />
                                            <span>
                                                <strong>{new Date(f.occurredAt).toLocaleDateString()}</strong>: {f.description} 
                                                <span style={{fontSize: '0.8em', color: '#666'}}> ({f.severity})</span>
                                            </span>
                                        </FailureItem>
                                    ))
                                )}
                            </FailuresList>
                        </Field>
                    )}

                    <FormRow>
                        <Field>
                            <Label>Tipo</Label>
                            <SelectInput
                                value={formData.type}
                                onChange={handleFieldChange("type")}
                            >
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                                <option value="Predictivo">Predictivo</option>
                            </SelectInput>
                            {errors.type && <ErrorText>{errors.type}</ErrorText>}
                        </Field>

                        <Field>
                            <Label>Técnico</Label>
                            <SelectInput
                                value={formData.technicianId}
                                onChange={handleFieldChange("technicianId")}
                            >
                                <option value="">Sin asignar</option>
                                {technicians.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </Field>
                    </FormRow>

                    <FormRow>
                        <Field>
                            <Label>Fecha y hora</Label>
                            <TextInput
                                type="datetime-local"
                                value={formData.performedAt}
                                onChange={handleFieldChange("performedAt")}
                            />
                            {errors.performedAt && <ErrorText>{errors.performedAt}</ErrorText>}
                        </Field>

                        <Field>
                            <Label>Duración (min)</Label>
                            <NumberInput
                                min={0}
                                placeholder="0"
                                value={formData.durationMinutes}
                                onChange={handleFieldChange("durationMinutes")}
                            />
                            {errors.durationMinutes && <ErrorText>{errors.durationMinutes}</ErrorText>}
                        </Field>
                    </FormRow>

                    <Field>
                        <Label>Costo estimado</Label>
                        <NumberInput
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                            value={formData.cost}
                            onChange={handleFieldChange("cost")}
                        />
                        {errors.cost && <ErrorText>{errors.cost}</ErrorText>}
                    </Field>

                    <Field>
                        <Label>Notas adicionales</Label>
                        <TextArea
                            placeholder="Describe el trabajo realizado..."
                            value={formData.notes}
                            onChange={handleFieldChange("notes")}
                        />
                    </Field>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit">
                            {initialData ? "Guardar cambios" : "Crear registro"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </Modal>
    );
}