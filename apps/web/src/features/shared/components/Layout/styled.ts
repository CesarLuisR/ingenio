import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

// --- Layout Principal ---
export const Container = styled.div`
  min-height: 100vh;
  background-color: #f8fafc; /* Slate 50 - Fondo general suave */
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

// --- Sidebar (Barra Lateral) ---
export const Sidebar = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px; /* Un poco más ancha para mejor lectura */
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);

  @media (max-width: 1024px) {
    /* En móviles/tablets podríamos ocultarla o usar un drawer, 
       por ahora la mantenemos simple */
    transform: translateX(0); 
  }
`;

export const SidebarHeader = styled.div`
  padding: 32px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin: 4px 0 0 0;
`;

// --- Navegación ---
export const Nav = styled.nav`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1; /* Empuja el footer hacia abajo */
  overflow-y: auto;

  /* Scrollbar fina */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

export const NavLinkStyled = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  /* Colores base */
  color: ${(props) => (props.$active ? "#1d4ed8" : "#475569")};
  background-color: ${(props) => (props.$active ? "#eff6ff" : "transparent")};

  /* Icono (el emoji) */
  span {
    font-size: 18px;
    filter: ${(props) => (props.$active ? "none" : "grayscale(100%) opacity(0.7)")};
    transition: filter 0.2s;
  }

  &:hover {
    background-color: ${(props) => (props.$active ? "#eff6ff" : "#f8fafc")};
    color: ${(props) => (props.$active ? "#1d4ed8" : "#1e293b")};
    transform: translateX(4px);

    span {
      filter: none;
    }
  }

  /* Indicador activo lateral (opcional, estilo muy moderno) */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background-color: #2563eb;
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity 0.2s;
  }
`;

// --- Footer del Sidebar (Usuario) ---
export const SidebarFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  .name {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }
  .role {
    font-size: 12px;
    color: #64748b;
  }
`;

// --- Contenido Principal ---
export const MainContent = styled.main`
  margin-left: 280px; /* Mismo ancho que el sidebar */
  width: calc(100% - 280px);
  padding: 0; /* El padding lo manejan las páginas internas (Container) */
  
  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
    padding-top: 80px; /* Espacio para un header móvil si existiera */
  }
`;