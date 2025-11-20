import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../../store/sessionStore";
import { api } from "../../lib/api";
import {
    PageContainer,
    HeroSection,
    Brand,
    HeroContent,
    FormSection,
    FormContainer,
    FormHeader,
    Form,
    InputGroup,
    Label,
    Input,
    Button,
    ErrorMsg,
    FooterText
} from "./styled";

export default function LoginModule() {
    const navigate = useNavigate();
    const setUser = useSessionStore((s) => s.setUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevenir reload si se usa form
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Por favor ingresa tus credenciales.");
            return;
        }

        setLoading(true);
        try {
            const user = await api.login(email, password);
            setUser(user);
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            {/* LADO IZQUIERDO - BRANDING & HERO */}
            <HeroSection>
                <Brand>
                    📡 IngenioMonitor
                </Brand>
                
                <HeroContent>
                    <h1>Control total de tus operaciones.</h1>
                    <p>
                        Plataforma de monitoreo industrial avanzado. 
                        Supervisa sensores, gestiona mantenimientos y optimiza 
                        la eficiencia de tu planta en tiempo real.
                    </p>
                </HeroContent>

                <div style={{ fontSize: 14, color: '#64748b' }}>
                    © 2024 Industrial Systems v1.0
                </div>
            </HeroSection>

            {/* LADO DERECHO - FORMULARIO */}
            <FormSection>
                <FormContainer>
                    <FormHeader>
                        <h2>Bienvenido de nuevo</h2>
                        <p>Ingresa a tu cuenta para acceder al dashboard.</p>
                    </FormHeader>

                    {error && <ErrorMsg>{error}</ErrorMsg>}

                    <Form as="form" onSubmit={handleLogin}>
                        <InputGroup>
                            <Label>Correo electrónico</Label>
                            <Input
                                type="email"
                                placeholder="ejemplo@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label>Contraseña</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </InputGroup>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Autenticando..." : "Iniciar Sesión"}
                        </Button>
                    </Form>

                    <FooterText>
                        ¿Olvidaste tu contraseña? <a href="#">Recuperar acceso</a>
                    </FooterText>
                </FormContainer>
            </FormSection>
        </PageContainer>
    );
}