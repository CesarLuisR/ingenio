import { useState, useEffect, useMemo } from "react";
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
import SearchableSelect from "../../shared/components/SearchableSelect";

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
        role: Role; 
        password: string;
        ingenioId: number | null;
    }>({
        name: "",
        email: "",
        role: ROLES.LECTOR, 
        password: "",
        ingenioId: sessionUser?.ingenioId ?? 1,
    });

    useEffect(() => {
        if (sessionUser?.role === ROLES.SUPERADMIN) {
            api.ingenios.getList().then(setIngenios).catch(console.error);
        }
    }, [sessionUser]);

    // Opciones para el SearchableSelect
    const ingenioOptions = useMemo(() => {
        // En el formulario, "seleccionar ingenio" es obligatorio, así que no necesitamos opción "Todos"
        return ingenios;
    }, [ingenios]);

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
                                    role: e.target.value as Role,
                                })
                            }
                        >
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

                    {/* USAMOS EL SEARCHABLE SELECT PARA EL INGENIO */}
                    {sessionUser?.role === ROLES.SUPERADMIN && (
                         <FormGroup>
                            <Label>Ingenio</Label>
                            <div style={{zIndex: 50}}>
                                <SearchableSelect 
                                    options={ingenioOptions}
                                    value={formData.ingenioId || 0}
                                    onChange={(val) => setFormData({...formData, ingenioId: val})}
                                    placeholder="Seleccionar Ingenio..."
                                />
                            </div>
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