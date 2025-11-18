// src/pages/Usuarios/components/UserForm.tsx
import { useState } from "react";
import { api } from "../../../lib/api";
import {
    Modal,
    ModalContent,
    ModalTitle,
    Form,
    FormGroup,
    Label,
    Input,
    Select,
    ButtonGroup,
    CancelButton,
    SubmitButton,
} from "./styledModal";
import type { User } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

export default function UserForm({
    initialData,
    onClose,
    onSave,
}: {
    initialData?: User | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const sessionUser = useSessionStore((s) => s.user);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        role: (initialData?.role as any) || "viewer",
        password: "",
        ingenioId: sessionUser?.ingenioId ?? null,
    });

    const isEditing = Boolean(initialData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                ingenioId: formData.ingenioId,
            };

            if (formData.password.trim()) {
                payload.password = formData.password;
            }

            if (isEditing) {
                await api.updateUser(initialData!.id.toString(), payload);
            } else {
                await api.createUser(payload);
            }

            onSave();
        } catch (err) {
            console.error("Error guardando usuario:", err);
        }
    };

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</ModalTitle>

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
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Rol</Label>
                        <Select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value as any,
                                })
                            }
                        >
                            <option value="viewer">Visualizador</option>
                            <option value="technician">Técnico</option>
                            <option value="admin">Administrador</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>Contraseña {isEditing && "(opcional)"}</Label>
                        <Input
                            type="password"
                            minLength={isEditing ? 0 : 6}
                            placeholder={isEditing ? "Dejar vacío para no cambiar" : ""}
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                    </FormGroup>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>
                            Cancelar
                        </CancelButton>

                        <SubmitButton type="submit">
                            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </Modal>
    );
}
