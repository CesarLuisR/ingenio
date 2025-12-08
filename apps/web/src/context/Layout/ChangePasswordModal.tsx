import { useState } from "react";
import { api } from "../../lib/api"; // Ajusta la ruta según tu estructura
import {
    ModalOverlay, // Asegúrate que estos existan en tu styled compartido o impórtalos
    ModalContent,
    ModalTitle,
    Form,
    FormGroup,
    Label,
    Input,
    ButtonGroup,
    CancelButton,
    SubmitButton,
} from "./styled"; // Ajusta la ruta a tu archivo styled

interface Props {
    onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            // Usamos el método que me mostraste
            await api.changePassword(password);
            alert("Contraseña actualizada exitosamente.");
            onClose();
        } catch (err) {
            console.error(err);
            setError("Error al actualizar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Cambiar Contraseña</ModalTitle>
                
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Nueva Contraseña</Label>
                        <Input
                            type="password"
                            required
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Confirmar Contraseña</Label>
                        <Input
                            type="password"
                            required
                            placeholder="******"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </FormGroup>

                    {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose} disabled={loading}>
                            Cancelar
                        </CancelButton>
                        <SubmitButton type="submit" disabled={loading || !password}>
                            {loading ? "Guardando..." : "Actualizar"}
                        </SubmitButton>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
}