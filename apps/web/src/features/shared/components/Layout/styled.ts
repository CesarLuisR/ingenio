import { Link } from "react-router-dom";
import styled from "styled-components";

// --- Layout Principal ---
export const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

// --- MOBILE HEADER (solo visible en móvil) ---
export const MobileHeader = styled.header`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: ${({ theme }) => theme.colors.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0 16px;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

export const MobileMenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:active {
    transform: scale(0.95);
  }
`;

// --- MOBILE OVERLAY ---
export const MobileOverlay = styled.div`
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 49;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
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

  @media (max-width: 768px) {
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
    z-index: 51;
    box-shadow: ${({ $isOpen }) => ($isOpen ? '4px 0 16px rgba(0,0,0,0.1)' : 'none')};
  }
`;

export const SidebarHeader = styled.div`
  padding: 32px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
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

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 65px;
    background-color: ${({ theme }) => theme.colors.card};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
    z-index: 100;
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
    justify-content: space-around;
    align-items: center;
  }
`;

export const MobileNavItem = styled(Link) <{ $active: boolean }>`
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

  .icon {
    font-size: 22px;
    filter: ${(props) => (props.$active ? "none" : "grayscale(100%) opacity(0.6)")};
    transition: all 0.2s;
    transform: ${(props) => (props.$active ? "scale(1.1)" : "scale(1)")};
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    color: ${(props) => (props.$active ? "#1d4ed8" : "#64748b")};
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

  ${(props) => props.$active && `
    background-color: ${props.theme.colors.background};
  `}
`;

// --- Contenido Principal ---
export const MainContent = styled.main`
  margin-left: 280px;
  width: calc(100% - 280px);
  padding: 0;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding-top: 60px; /* Altura del header móvil */
    padding-bottom: 65px; /* Altura del bottom nav */
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

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
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
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 18px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
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

    @media (max-width: 768px) {
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