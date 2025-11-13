import { useState } from "react";
import { api } from "../../../lib/api";
import {
	Modal,
	ModalContent,
	ModalTitle,
	CloseButton,
	Form,
	FormGroup,
	Input,
	Label,
	ButtonGroup,
	CancelButton,
	SubmitButton,
} from "../styled";

import type { Technician } from "../../../types";

export default function TechnicianForm({
	initialData,
	onClose,
	onSave,
}: {
	initialData?: Technician | null;
	onClose: () => void;
	onSave: () => void;
}) {
	const [formData, setFormData] = useState({
		name: initialData?.name || "",
		email: initialData?.email || "",
		phone: initialData?.phone || "",
		active: initialData?.active ?? true,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (initialData) {
				// EDITAR
				await api.updateTechnician(initialData.id.toString(), {
					name: formData.name,
					email: formData.email || undefined,
					phone: formData.phone || undefined,
					active: formData.active,
				});
			} else {
				// CREAR
				await api.createTechnician({
					name: formData.name,
					email: formData.email || undefined,
					phone: formData.phone || undefined,
					active: formData.active,
				});
			}

			onSave();
		} catch (err) {
			console.error("Error guardando técnico:", err);
		}
	};

	return (
		<Modal onClick={onClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<CloseButton onClick={onClose}>×</CloseButton>

				<ModalTitle>
					{initialData ? "Editar Técnico" : "Registrar Técnico"}
				</ModalTitle>

				<Form onSubmit={handleSubmit}>
					<FormGroup>
						<Label>Nombre</Label>
						<Input
							required
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Email</Label>
						<Input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Teléfono</Label>
						<Input
							value={formData.phone}
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Estado</Label>
						<select
							style={{
								padding: "10px 12px",
								borderRadius: "10px",
								border: "1px solid #d1d5db",
								fontSize: "14px",
								background: "#f9fafb",
							}}
							value={formData.active ? "activo" : "inactivo"}
							onChange={(e) =>
								setFormData({
									...formData,
									active: e.target.value === "activo",
								})
							}>
							<option value="activo">Activo</option>
							<option value="inactivo">Inactivo</option>
						</select>
					</FormGroup>

					<ButtonGroup>
						<CancelButton type="button" onClick={onClose}>
							Cancelar
						</CancelButton>

						<SubmitButton type="submit">
							{initialData ? "Guardar cambios" : "Registrar"}
						</SubmitButton>
					</ButtonGroup>
				</Form>
			</ModalContent>
		</Modal>
	);
}
