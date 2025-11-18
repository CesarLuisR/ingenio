import { useState } from "react";
import { api } from "../../../lib/api";
import {
    Modal,
    ModalContent,
    ModalTitle,
    CloseButton,
    Form,
    FormGroup,
    Label,
    Input,
    Select,
    ButtonGroup,
    CancelButton,
    SubmitButton,
} from "../styled";

import type { Technician } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

export default function TechnicianForm({
    initialData,
    onClose,
    onSave,
}: {
    initialData?: Technician | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const user = useSessionStore((s) => s.user);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        active: initialData?.active ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                active: formData.active,
                ingenioId: user?.ingenioId ?? null,
            };

            if (initialData) {
                await api.updateTechnician(initialData.id.toString(), payload);
            } else {
                await api.createTechnician(payload);
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
                        <Select
                            value={formData.active ? "activo" : "inactivo"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    active: e.target.value === "activo",
                                })
                            }>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </Select>
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
