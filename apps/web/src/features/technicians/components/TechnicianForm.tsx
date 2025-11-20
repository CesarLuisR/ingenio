import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Technician } from "../../../types";
import {
    Modal,
    ModalContent,
    CloseButton,
    ModalTitle,
    Form,
    FormGroup,
    Label,
    Input,
    Select,
    ButtonGroup,
    CancelButton,
    SubmitButton,
} from "../styled";

interface Props {
    initialData?: Technician | null;
    onClose: () => void;
    onSave: () => void;
}

export default function TechnicianForm({ initialData, onClose, onSave }: Props) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        active: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email || "",
                phone: initialData.phone || "",
                active: initialData.active,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (initialData) {
                await api.updateTechnician(initialData.id.toString(), formData);
            } else {
                await api.createTechnician({ ...formData, ingenioId: 1 }); // Ajustar ingenioId según contexto
            }
            onSave();
        } catch (error) {
            console.error(error);
            alert("Error al guardar el técnico");
        }
    };

    return (
        <Modal>
            <ModalContent>
                <CloseButton onClick={onClose}>×</CloseButton>
                <ModalTitle>
                    {initialData ? "Editar Técnico" : "Registrar Técnico"}
                </ModalTitle>

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Nombre Completo</Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej. Juan Pérez"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Correo Electrónico</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="juan@empresa.com"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Teléfono</Label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 809 000 0000"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Estado</Label>
                        <Select
                            value={formData.active ? "active" : "inactive"}
                            onChange={(e) =>
                                setFormData({ ...formData, active: e.target.value === "active" })
                            }
                        >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </Select>
                    </FormGroup>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit">
                            {initialData ? "Guardar Cambios" : "Crear Técnico"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </Modal>
    );
}