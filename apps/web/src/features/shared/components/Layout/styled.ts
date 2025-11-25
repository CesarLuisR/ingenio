import { Link } from "react-router-dom";
import styled from "styled-components";

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

// --- Footer del Sidebar (Usuario) ---
export const SidebarFooter = styled.div`
  /* Fijamos altura y padding para que se vea robusto */
  padding: 16px 20px; 
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  
  /* Flexbox para alinear todo horizontalmente */
  display: flex;
  align-items: center;
  gap: 12px; /* Espacio entre el avatar y el texto */
`;

export const UserAvatar = styled.div`
  /* Tamaño fijo y circular */
  width: 40px;
  height: 40px;
  min-width: 40px; /* Evita que se aplaste */
  border-radius: 50%;
  
  /* Gradiente moderno */
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  
  /* Centrado del texto (iniciales) */
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
  overflow: hidden; /* Por si el nombre es muy largo */
  
  .name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b; /* Slate-800: Más oscuro para legibilidad */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .role {
    font-size: 11px;
    font-weight: 500;
    color: #64748b; /* Slate-500 */
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
`;

// --- EL BOTÓN ARREGLADO ---
export const LogoutButton = styled.button`
  /* 1. Posicionamiento: Empujamos a la derecha */
  margin-left: auto;

  /* 2. Tamaño: Hacemos un cuadrado perfecto */
  width: 36px;
  height: 36px;
  
  /* 3. Flexbox: Centrar el icono perfectamente */
  display: flex;
  align-items: center;
  justify-content: center;

  /* 4. Estilos Base (Estado normal) */
  background-color: transparent;
  border: 1px solid transparent; /* Reserva espacio para el borde hover */
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8; /* Gris suave */
  
  /* Transición suave */
  transition: all 0.2s ease-in-out;

  /* 5. El Icono SVG */
  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2px; /* Asegura que se vea nítido */
  }

  /* 6. HOVER: Aquí es donde se ve bien */
  &:hover {
    background-color: #fef2f2; /* Fondo rojo muy suave */
    color: #dc2626;            /* Icono rojo intenso */
    border-color: #fecaca;     /* Borde rojo suave */
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
    transform: translateY(-1px);
  }

  /* 7. ACTIVE: Efecto de click */
  &:active {
    transform: translateY(0) scale(0.95);
    background-color: #fee2e2;
  }
`;

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
`;

export const ModalContent = styled.div`
    background-color: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
`;

export const ModalTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
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
    color: #1e293b;
`;

export const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #2563eb;
    }
`;

export const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

export const CancelButton = styled.button`
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f1f5f9;
    }
`;

export const SubmitButton = styled.button`
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background-color: #2563eb;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #1e40af;
    }
`;
  