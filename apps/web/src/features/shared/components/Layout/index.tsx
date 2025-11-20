import { Outlet, useLocation } from "react-router-dom";
import {
	Container,
	MainContent,
	Nav,
	NavLinkStyled,
	Sidebar,
	SidebarHeader,
	Subtitle,
	Title,
} from "./styled";
import { useSessionStore } from "../../../../store/sessionStore";
import { useEffect, useState } from "react";
import { api }from "../../../../lib/api";
import type { Ingenio } from "../../../../types";

export default function Layout() {
	const location = useLocation();
	const isActive = (path: string) => location.pathname === path;
	const user = useSessionStore((s) => s.user);
	const [ingenio, setIngenio] = useState<Ingenio>();

	useEffect(() => {
		const getIngenioInfo = async () => {
			if (user?.ingenioId) {
				const ingenio = await api.getIngenio(user?.ingenioId);
				setIngenio(ingenio);
			}
		}

		getIngenioInfo();
	}, []);

	return (
		<Container>
			<Sidebar>
				<SidebarHeader>
					<Title>📡 {ingenio?.name}</Title>
					<Subtitle>Sistema de Monitoreo</Subtitle>
				</SidebarHeader>

				<Nav>
					<NavLinkStyled to="/" $active={isActive("/")}>
						🏠 Dashboard
					</NavLinkStyled>
					<NavLinkStyled
						to="/maquinas"
						$active={isActive("/maquinas")}>
						⚙️ Maquinas 
					</NavLinkStyled>
					<NavLinkStyled
						to="/sensores"
						$active={isActive("/sensores")}>
						📊 Sensores
					</NavLinkStyled>
					<NavLinkStyled
						to="/mantenimientos"
						$active={isActive("/mantenimientos")}>
						🔧 Mantenimientos
					</NavLinkStyled>
					<NavLinkStyled to="/fallos" $active={isActive("/fallos")}>
						⚠️ Fallos
					</NavLinkStyled>
					<NavLinkStyled to="/tecnicos" $active={isActive("/tecnicos")}>
						👷‍♂️️ Técnicos 
					</NavLinkStyled>
					<NavLinkStyled
						to="/usuarios"
						$active={isActive("/usuarios")}>
						👥 Usuarios
					</NavLinkStyled>
					<NavLinkStyled
						to="/analisis"
						$active={isActive("/analisis")}>
						📈 Análisis
					</NavLinkStyled>
				</Nav>
			</Sidebar>

			<MainContent>
				<Outlet />
			</MainContent>
		</Container>
	);
}