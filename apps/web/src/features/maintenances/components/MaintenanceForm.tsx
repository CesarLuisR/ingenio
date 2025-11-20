import type { Maintenance, Machine, Technician } from "../../../types";
import { useMaintenanceForm } from "../hooks/useMaintenanceForm";

import {
	ButtonGroup,
	CancelButton,
	CloseIconButton,
	ErrorText,
	Field,
	Form,
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

export default function MaintenanceForm({
	machines,
	technicians,
	initialData,
	onClose,
	onSave,
}: {
	machines: Machine[];
	technicians: Technician[];
	initialData?: Maintenance | null;
	onClose: () => void;
	onSave: () => void;
}) {
	const { formData, errors, handleFieldChange, handleSubmit } =
		useMaintenanceForm(initialData ?? null, onSave);

	return (
		<Modal onClick={onClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<CloseIconButton aria-label="Cerrar" onClick={onClose}>
					×
				</CloseIconButton>

				<ModalTitle>
					{initialData ? "Editar Mantenimiento" : "Nuevo Mantenimiento"}
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
						{errors.machineId && (
							<ErrorText>{errors.machineId}</ErrorText>
						)}
					</Field>

					<Field>
						<Label>Tipo de mantenimiento</Label>
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

					<Field>
						<Label>Fecha y hora</Label>
						<TextInput
							type="datetime-local"
							value={formData.performedAt}
							onChange={handleFieldChange("performedAt")}
						/>
						{errors.performedAt && (
							<ErrorText>{errors.performedAt}</ErrorText>
						)}
					</Field>

					<Field>
						<Label>Duración (minutos)</Label>
						<NumberInput
							min={0}
							value={formData.durationMinutes}
							onChange={handleFieldChange("durationMinutes")}
						/>
						{errors.durationMinutes && (
							<ErrorText>{errors.durationMinutes}</ErrorText>
						)}
					</Field>

					<Field>
						<Label>Costo</Label>
						<NumberInput
							min={0}
							step="0.01"
							value={formData.cost}
							onChange={handleFieldChange("cost")}
						/>
						{errors.cost && <ErrorText>{errors.cost}</ErrorText>}
					</Field>

					<Field>
						<Label>Notas</Label>
						<TextArea
							rows={3}
							value={formData.notes}
							onChange={handleFieldChange("notes")}
						/>
					</Field>

					<ButtonGroup>
						<CancelButton type="button" onClick={onClose}>
							Cancelar
						</CancelButton>
						<SubmitButton type="submit">
							{initialData ? "Guardar cambios" : "Crear"}
						</SubmitButton>
					</ButtonGroup>
				</Form>
			</ModalContent>
		</Modal>
	);
}
