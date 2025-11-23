import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import {
    ModalOverlay,
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
} from "../styled";
import { ROLES, type User, type Ingenio } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

type Role = typeof ROLES[keyof typeof ROLES];

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
    const [ingenios, setIngenios] = useState<Ingenio[]>([]);

    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        role: Role; // <--- Aquí usamos el tipo, no el objeto
        password: string;
        ingenioId: number | null;
    }>({
        name: "",
        email: "",
        role: ROLES.LECTOR, // Valor por defecto seguro
        password: "",
        ingenioId: sessionUser?.ingenioId ?? 1,
    });

    useEffect(() => {
        if (sessionUser?.role === ROLES.SUPERADMIN) {
            api.getAllIngenios().then(setIngenios).catch(console.error);
        }
    }, [sessionUser]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                role: initialData.role as Role, 
                password: "",
                ingenioId: initialData.ingenioId ?? sessionUser?.ingenioId ?? 1,
            });
        } else {
            // Reset para nuevo usuario
            setFormData({
                name: "",
                email: "",
                role: ROLES.LECTOR,
                password: "",
                ingenioId: sessionUser?.ingenioId ?? 1,
            });
        }
    }, [initialData, sessionUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                ingenioId: Number(formData.ingenioId),
            };

            if (formData.password.trim()) {
                payload.password = formData.password;
            } else if (!initialData) {
                alert("La contraseña es obligatoria para nuevos usuarios");
                return;
            }

            if (initialData) {
                await api.updateUser(initialData.id.toString(), payload);
            } else {
                await api.createUser(payload);
            }

            onSave();
        } catch (err) {
            console.error("Error guardando usuario:", err);
            alert("Error al guardar el usuario. Verifica los datos.");
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>{initialData ? "Editar Usuario" : "Nuevo Usuario"}</ModalTitle>

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Nombre Completo</Label>
                        <Input
                            required
                            placeholder="Ej: Juan Pérez"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Correo Electrónico</Label>
                        <Input
                            required
                            type="email"
                            placeholder="juan@empresa.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Rol en el sistema</Label>
                        <Select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    // 3. CASTEO CORRECTO: Convertimos string -> Role
                                    role: e.target.value as Role,
                                })
                            }
                        >
                            {/* 4. USAMOS LAS CONSTANTES: Para que los values coincidan con el tipo */}
                            <option value={ROLES.LECTOR}>Visualizador (Solo lectura)</option>
                            <option value={ROLES.TECNICO}>Técnico (Gestión básica)</option>
                            <option value={ROLES.ADMIN}>Administrador (Control total)</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>
                            Contraseña {initialData && <span style={{fontWeight: 400, color: '#94a3b8'}}>(Dejar en blanco para mantener)</span>}
                        </Label>
                        <Input
                            type="password"
                            minLength={initialData ? 0 : 6}
                            placeholder="******"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                    </FormGroup>

                    {sessionUser?.role === ROLES.SUPERADMIN && (
                         <FormGroup>
                            <Label>Ingenio</Label>
                            <Select 
                                value={formData.ingenioId || ''}
                                onChange={(e) => setFormData({...formData, ingenioId: Number(e.target.value)})}
                            >
                                <option value="" disabled>Seleccionar Ingenio</option>
                                {ingenios.map(ing => (
                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                ))}
                            </Select>
                         </FormGroup>
                    )}

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit">
                            {initialData ? "Guardar Cambios" : "Crear Usuario"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
}