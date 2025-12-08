import { useState, useMemo } from "react";
import type { Maintenance, Machine, Technician, Failure } from "../../../types";
import { useMaintenanceForm } from "../hooks/useMaintenanceForm";
import SearchableSelect from "../../shared/components/SearchableSelect";

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
} from "../styled";

// Función auxiliar para evitar el "Invalid date"
const formatDate = (dateString?: string) => {
  if (!dateString) return "Fecha desconocida";
  const d = new Date(dateString);
  // Verificamos si la fecha es válida
  if (isNaN(d.getTime())) return "Fecha inválida";
  return d.toLocaleDateString();
};

export default function MaintenanceForm({
  machines,
  technicians,
  failures,
  initialData,
  onClose,
  onSave,
}: {
  machines: Machine[];
  technicians: Technician[];
  failures: Failure[];
  initialData?: (Maintenance & { failures?: Failure[] }) | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { formData, errors, handleFieldChange, handleFailureToggle, handleSubmit, setFormData } =
    useMaintenanceForm(initialData ?? null, onSave);

  // Estado para el buscador de fallas
  const [failureSearch, setFailureSearch] = useState("");

  // Lógica combinada: Filtrar por máquina + Pendientes/Vinculadas + Búsqueda texto + Ordenar fecha
  const relevantFailures = useMemo(() => {
    // 1. Filtrar base (Máquina y Estado)
    let filtered = failures.filter((f) => {
      const isForSelectedMachine = f.machineId.toString() === formData.machineId;
      const isAlreadyLinked = initialData?.failures?.some((linked) => linked.id === f.id);
      
      // Mostrar si es de la máquina Y (está pendiente O ya estaba vinculada)
      return isForSelectedMachine && (f.status !== "resuelto" || isAlreadyLinked);
    });

    // 2. Filtrar por texto de búsqueda (si existe)
    if (failureSearch.trim()) {
      const lowerSearch = failureSearch.toLowerCase();
      filtered = filtered.filter(f => 
        f.description.toLowerCase().includes(lowerSearch)  
      );
    }

    // 3. Ordenar por fecha (Más recientes primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.occurredAt).getTime();
      const dateB = new Date(b.occurredAt).getTime();
      return dateB - dateA; // Descendente
    });
  }, [failures, formData.machineId, initialData, failureSearch]);

  // Mapeo para SearchableSelect - Máquinas
  const machineOptions = useMemo(() => {
    return machines.map((m) => ({ id: m.id, name: m.name, code: m.code || "" }));
  }, [machines]);

  // Mapeo para SearchableSelect - Técnicos
  const technicianOptions = useMemo(() => {
    return technicians.map((t) => ({ id: t.id, name: t.name }));
  }, [technicians]);

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
            <div style={{ width: "100%" }}>
              <SearchableSelect
                options={machineOptions}
                value={Number(formData.machineId) || 0}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, machineId: val.toString() }));
                }}
                placeholder="Seleccionar máquina"
              />
            </div>
            {errors.machineId && <ErrorText>{errors.machineId}</ErrorText>}
          </Field>

          {/* SECCIÓN DE FALLAS */}
          {formData.machineId && (
            <Field>
              <Label>Fallas Asociadas (Seleccionar para vincular)</Label>
              
              {/* Buscador de fallas */}
              <div style={{ marginBottom: "8px" }}>
                <TextInput 
                  placeholder="Buscar falla por descripción..." 
                  value={failureSearch}
                  onChange={(e) => setFailureSearch(e.target.value)}
                  style={{ fontSize: "13px", padding: "6px 10px" }}
                />
              </div>

              <FailuresList>
                {relevantFailures.length === 0 ? (
                  <EmptyState>
                    {failureSearch 
                      ? "No se encontraron fallas con esa descripción." 
                      : "No hay fallas pendientes para esta máquina."}
                  </EmptyState>
                ) : (
                  relevantFailures.map((f) => (
                    <FailureItem key={f.id}>
                      <input
                        type="checkbox"
                        checked={formData.failureIds.includes(f.id.toString())}
                        onChange={() => handleFailureToggle(f.id.toString())}
                        style={{ cursor: "pointer" }}
                      />
                      <span 
                        onClick={() => handleFailureToggle(f.id.toString())} 
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        {/* Usamos la función segura formatDate */}
                        <strong>{formatDate(f.occurredAt)}</strong>: {f.description}
                        <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "6px" }}>
                           ({f.severity})
                        </span>
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
              <SelectInput value={formData.type} onChange={handleFieldChange("type")}>
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Predictivo">Predictivo</option>
              </SelectInput>
              {errors.type && <ErrorText>{errors.type}</ErrorText>}
            </Field>

            <Field>
              <Label>Técnico</Label>
              <div style={{ width: "100%" }}>
                <SearchableSelect
                  options={technicianOptions}
                  value={Number(formData.technicianId) || 0}
                  onChange={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      technicianId: val === 0 ? "" : val.toString(),
                    }));
                  }}
                  placeholder="Sin asignar"
                />
              </div>
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