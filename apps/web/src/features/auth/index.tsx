import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../../store/sessionStore";
import { api } from "../../lib/api";

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f3f4f6;
`;

const Card = styled.div`
	background: white;
	padding: 2rem 2.5rem;
	border-radius: 12px;
	width: 100%;
	max-width: 380px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
	font-size: 1.75rem;
	font-weight: bold;
	color: #111827;
	text-align: center;
	margin-bottom: 1.5rem;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.75rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	font-size: 1rem;
	margin-bottom: 1rem;
	outline: none;

	&:focus {
		border-color: #2563eb;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
	}
`;

const Button = styled.button`
	width: 100%;
	padding: 0.75rem 1rem;
	background-color: #2563eb;
	color: white;
	font-size: 1rem;
	border: none;
	border-radius: 8px;
	font-weight: bold;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #1e40af;
	}
`;

const ErrorMsg = styled.div`
	background: #fee2e2;
	color: #991b1b;
	padding: 0.75rem;
	border-radius: 6px;
	margin-bottom: 1rem;
	font-size: 0.9rem;
	text-align: center;
`;

export default function LoginModule() {
	const navigate = useNavigate();
	const setUser = useSessionStore((s) => s.setUser);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		setError("");

		if (!email.trim() || !password.trim()) {
			setError("Completa todos los campos antes de continuar");
			return;
		}

		try {
			const user = await api.login(email, password);
			setUser(user);
			navigate("/");
		} catch (err: any) {
			setError(err.message || "Error al iniciar sesión");
		}
	};

	return (
		<Container>
			<Card>
				<Title>Iniciar Sesión</Title>

				{error && <ErrorMsg>{error}</ErrorMsg>}

				<Input
					type="email"
					placeholder="Correo electrónico"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<Input
					type="password"
					placeholder="Contraseña"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<Button onClick={handleLogin}>Entrar</Button>
			</Card>
		</Container>
	);
}
