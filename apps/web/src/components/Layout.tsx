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

export default function Layout() {
	const location = useLocation();
	const isActive = (path: string) => location.pathname === path;

	return (
		<Container>
			<Sidebar>
				<SidebarHeader>
					<Title>📡 Ingenio</Title>
					<Subtitle>Sistema de Monitoreo</Subtitle>
				</SidebarHeader>

				<Nav>
					<NavLinkStyled to="/" $active={isActive("/")}>
						🏠 Dashboard
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
