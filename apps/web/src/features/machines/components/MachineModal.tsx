import { useEffect, useState, type FormEvent } from "react";
import type { Machine } from "../../../types";
import { api } from "../../../lib/api";
import { useSessionStore } from "../../../store/sessionStore";
import {
    Modal,
    ModalContent,
    CloseIconButton,
    ModalTitle,
    Form,
    Field,
    Label,
    TextInput,
    TextArea,
    ErrorText,
    ButtonGroup,
    CancelButton,
    SubmitButton,
    InlineInfoPill,
} from "../styled";

interface MachineFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (machine: Machine) => void;
    mode: "create" | "edit";
    initialMachine?: Machine | null;
}

// Eliminamos el array MACHINE_TYPES porque ahora es un input libre

export function MachineFormModal({
    isOpen,
    onClose,
    onSaved,
    mode,
    initialMachine,
}: MachineFormModalProps) {
    const { user } = useSessionStore();
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [type, setType] = useState<string>("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [active, setActive] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);

        if (mode === "edit" && initialMachine) {
            setName(initialMachine.name ?? "");
            setCode(initialMachine.code ?? "");
            setType(initialMachine.type ?? "");
            setDescription(initialMachine.description ?? "");
            setLocation(initialMachine.location ?? "");
            setActive(initialMachine.active);
        } else {
            setName("");
            setCode("");
            setType("");
            setDescription("");
            setLocation("");
            setActive(true);
        }
    }, [isOpen, mode, initialMachine]);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?.ingenioId) {
            setError("No se encontró el ingenio del usuario.");
            return;
        }

        if (!name.trim() || !code.trim()) {
            setError("Nombre y código son obligatorios.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const payload: Partial<Machine> = {
            name: name.trim(),
            code: code.trim(),
            type: type.trim() || null, // Aseguramos que si está vacío vaya como null
            description: description || null,
            location: location || null,
            active,
            ingenioId: user.ingenioId,
        };

        try {
            let saved: Machine;
            if (mode === "edit" && initialMachine) {
                saved = await api.updateMachine(initialMachine.id, payload);
            } else {
                saved = await api.createMachine(payload);
            }
            onSaved(saved);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(
                err?.message || "Error al guardar la máquina. Intenta de nuevo."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal>
            <ModalContent>
                <CloseIconButton onClick={onClose}>×</CloseIconButton>
                <ModalTitle>
                    {mode === "edit" ? "Editar máquina" : "Registrar nueva máquina"}
                </ModalTitle>

                <Form onSubmit={handleSubmit}>
                    <Field>
                        <Label>Nombre</Label>
                        <TextInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Bomba principal #1"
                            required
                        />
                    </Field>

                    <Field>
                        <Label>Código interno</Label>
                        <TextInput
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ej: BOM-001"
                            required
                        />
                    </Field>

                    <Field>
                        <Label>Tipo</Label>
                        {/* CAMBIO: TextInput en lugar de SelectInput */}
                        <TextInput
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            placeholder="Ej: Bomba Centrifuga, Motor Diésel, etc."
                        />
                    </Field>

                    <Field>
                        <Label>Ubicación</Label>
                        <TextInput
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej: Línea 2 - Sector norte"
                        />
                    </Field>

                    <Field>
                        <Label>Descripción</Label>
                        <TextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notas adicionales sobre la máquina..."
                        />
                    </Field>

                    <Field>
                        <Label>Ingenio</Label>
                        <InlineInfoPill>
                            {user?.ingenioId
                                ? `Ingenio ID: ${user.ingenioId}`
                                : "Ingenio no disponible"}
                        </InlineInfoPill>
                    </Field>

                    <Field>
                        <Label>
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                style={{ marginRight: 6 }}
                            />
                            Máquina activa
                        </Label>
                    </Field>

                    {error && <ErrorText>{error}</ErrorText>}

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose} disabled={submitting}>
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit" disabled={submitting}>
                            {submitting
                                ? "Guardando..."
                                : mode === "edit"
                                ? "Guardar cambios"
                                : "Crear máquina"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </Modal>
    );
}