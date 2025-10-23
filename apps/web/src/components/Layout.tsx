import { Link, Outlet, useLocation } from "react-router-dom"
import styled from "styled-components"

const Container = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`

const Sidebar = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 256px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const Nav = styled.nav`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const NavLinkStyled = styled(Link)<{ $active: boolean }>`
  display: block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  background-color: ${(props) => (props.$active ? "#eff6ff" : "transparent")};
  color: ${(props) => (props.$active ? "#1d4ed8" : "#374151")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#eff6ff" : "#f3f4f6")};
  }
`

const MainContent = styled.main`
  margin-left: 256px;
  padding: 2rem;
`

export default function Layout() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

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
          <NavLinkStyled to="/sensores" $active={isActive("/sensores")}>
            📊 Sensores
          </NavLinkStyled>
          <NavLinkStyled to="/mantenimientos" $active={isActive("/mantenimientos")}>
            🔧 Mantenimientos
          </NavLinkStyled>
          <NavLinkStyled to="/fallos" $active={isActive("/fallos")}>
            ⚠️ Fallos
          </NavLinkStyled>
          <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")}>
            👥 Usuarios
          </NavLinkStyled>
          <NavLinkStyled to="/analisis" $active={isActive("/analisis")}>
            📈 Análisis
          </NavLinkStyled>
        </Nav>
      </Sidebar>

      <MainContent>
        <Outlet />
      </MainContent>
    </Container>
  )
}
