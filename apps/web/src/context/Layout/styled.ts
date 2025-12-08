import { Link } from "react-router-dom";
import styled from "styled-components";

// --- Layout Principal ---
export const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

// --- GLOBAL HEADER CONTROLS ---
export const GlobalHeaderControls = styled.div`
  /* Default hidden on desktop if desired, but good for "Back" */
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 12px 16px;
  }
`;

export const GlobalBackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
  }
`;

// --- MOBILE HEADER (Oculto en rediseño anterior, pero podría reutilizarse si fuera necesario) ---
export const MobileHeader = styled.header`
  display: none !important;
`;

// --- Sidebar (Barra Lateral) ---
export const Sidebar = styled.aside<{ $isOpen?: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background-color: ${({ theme }) => theme.colors.card};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    transform: translateX(-100%); /* Siempre oculto en móvil, usaremos el Bottom Sheet */
    display: none; 
  }
`;

export const SidebarHeader = styled.div`
  padding: 32px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 4px 0 0 0;
`;

// --- Navegación ---
export const Nav = styled.nav`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 4px; }
`;

export const NavLinkStyled = styled(Link) <{ $active: boolean }>`
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

  color: ${(props) => (props.$active ? "#1d4ed8" : "#475569")};
  background-color: ${(props) => (props.$active ? "#eff6ff" : "transparent")};

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

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background-color: ${({ theme }) => theme.colors.accent.primary};
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity 0.2s;
  }
`;

// --- MOBILE BOTTOM NAVIGATION ---
export const MobileBottomNav = styled.nav`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 65px;
    background-color: ${({ theme }) => theme.colors.card}; /* O usar rgba con blur */
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
    z-index: 100;
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
    justify-content: space-around;
    align-items: center;
  }
`;

export const MobileNavItem = styled(Link) <{ $active?: boolean; as?: any; onClick?: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 64px;
  position: relative;
  border: none;
  background: transparent;
  cursor: pointer;

  .icon {
    font-size: 22px;
    filter: ${(props) => (props.$active ? "none" : "grayscale(100%) opacity(0.6)")};
    transition: all 0.2s;
    transform: ${(props) => (props.$active ? "scale(1.1)" : "scale(1)")};
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    color: ${(props) => (props.$active ? props.theme.colors.accent.primary : props.theme.colors.text.tertiary)};
    transition: color 0.2s;
  }

  /* Indicador activo superior */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 3px;
    border-radius: 0 0 3px 3px;
    background-color: ${({ theme }) => theme.colors.accent.primary};
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity 0.2s;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// --- Contenido Principal ---
export const MainContent = styled.main`
  margin-left: 280px;
  width: calc(100% - 280px);
  padding: 0;
  min-height: 100vh;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0;
    width: 100%;
    padding-top: 0;
    padding-bottom: 80px;
  }
`;

// --- Footer del Sidebar (Usuario) ---
export const SidebarFooter = styled.div`
  padding: 16px 20px; 
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2);
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .name {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .role {
    font-size: 11px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
`;

export const LogoutButton = styled.button`
  margin-left: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease-in-out;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2px;
  }

  &:hover {
    background-color: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.95);
    background-color: #fee2e2;
  }
`;

export const ThemeToggleButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  /* Añadimos un color de respaldo (gris) por si text.secondary no carga */
  color: ${({ theme }) => theme.colors.text.secondary || '#94a3b8'}; 
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  /* ELIMINA font-size, los SVGs usan width/height explícito */
  /* font-size: 18px;  <-- Borra esto */

  /* AGREGA ESTO: Apunta directamente al icono SVG */
  & > svg {
    display: block; /* Elimina espacios fantasma */
    stroke: currentColor; /* Fuerza a usar el color del botón */
    /* stroke-width: 2; Si se ve muy delgado, descomenta esto */
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    /* Asegura que al hacer hover, el color cambie al primario */
    color: ${({ theme }) => theme.colors.text.primary}; 
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

// --- Modal Styles ---
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
    background-color: ${({ theme }) => theme.colors.card};
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    width: 100%;
    max-width: 400px;
    margin: 16px;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      max-width: calc(100% - 32px);
    }
`;

export const ModalTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.colors.text.primary};
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.primary};
`;

export const Input = styled.input`
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.accent.primary};
        box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.primary}20;
    }
`;

export const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
`;

export const CancelButton = styled.button`
    padding: 10px 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    transition: all 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors.background};
        border-color: ${({ theme }) => theme.colors.text.secondary};
    }

    &:active {
        transform: scale(0.98);
    }
`;

export const SubmitButton = styled.button`
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.accent.primary};
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors.accent.hover};
        box-shadow: 0 2px 8px ${({ theme }) => theme.colors.accent.primary}40;
    }

    &:active {
        transform: scale(0.98);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// --- Mobile Menu Sheet Styles ---

export const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 200;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.3s ease;
`;

export const MobileMenuSheet = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.card};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px;
  padding-bottom: calc(85px + env(safe-area-inset-bottom)); /* Clear bottom nav */
  z-index: 201; /* Above Bottom Nav */
  transform: translateY(${({ $isOpen }) => ($isOpen ? "0%" : "100%")});
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
  max-height: 80vh;
  overflow-y: auto;
  
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const MobileMenuAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
`;

export const MobileMenuUserInfo = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
  }
`;

export const MobileMenuSectionTitle = styled.h4`
    font-size: 12px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-weight: 700;
    letter-spacing: 0.5px;
    margin: 0;
`;

export const MobileMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

export const MobileMenuLink = styled(Link) <{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: ${({ $active, theme }) => $active ? theme.colors.background : 'transparent'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accent.primary : theme.colors.border};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;

  span { font-size: 18px; }

  &:active {
    transform: scale(0.98);
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const MobileMenuActionRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const MobileMenuButton = styled.button`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};

    &.primary {
        background: ${({ theme }) => theme.colors.background};
    }

    &.danger {
        color: #ef4444;
        border-color: #fecaca;
        background: #fef2f2;
    }

    &:active {
        transform: scale(0.98);
    }
`;