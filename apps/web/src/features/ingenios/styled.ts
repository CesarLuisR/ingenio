import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  padding: 2rem 3rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  animation: ${fadeIn} 0.4s ease-out;
`;

// ... Header, HeaderGroup, Title, Subtitle, AddButton igual que antes ...

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const HeaderGroup = styled.div``;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.25rem 0 0 0;
  font-weight: 500;
`;

export const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.primary};
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

export const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%; /* Asegura que tome el espacio en formularios verticales */
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  margin-left: 2px;
`;

/* CORRECCIÓN DE COLORES DEL FORMULARIO: 
   Usamos un fondo explícito (white o card) en lugar de heredar 'background' 
   para asegurar contraste en modales */
export const TextInput = styled.input`
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.card}; /* Mejor contraste */
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.primary}20; /* Sutil glow */
  }

  &::placeholder {
      color: ${({ theme }) => theme.colors.text.secondary}80;
  }
`;

export const SelectInput = styled.select`
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.primary}20;
  }
`;

export const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

// ... Listas e Items ...
export const IngeniosList = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ListHeader = styled.div`
  padding: 18px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px 12px 0 0;
`;

export const ListItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center; /* Alineación vertical centrada */

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ItemName = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ItemSub = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 10px; /* Espacio entre texto y badge */
`;

/* CORRECCIÓN: Badge mejorado */
export const Badge = styled.span<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? "#dcfce7" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#15803d" : "#64748b")};
  font-size: 11px;
  padding: 2px 8px;
  font-weight: 700;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

/* CORRECCIÓN: ActionButton más robusto con variantes */
export const ActionButton = styled.button<{ $variant?: "danger" | "warning" | "success" }>`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  /* Variantes de color */
  ${({ $variant }) =>
    $variant === "danger" &&
    css`
      color: #dc2626;
      border-color: #fecaca;
      &:hover {
        background: #fef2f2;
        border-color: #dc2626;
      }
    `}

  ${({ $variant }) =>
    $variant === "warning" &&
    css`
      color: #d97706;
      border-color: #fde68a;
      &:hover {
        background: #fffbeb;
        border-color: #d97706;
      }
    `}

    ${({ $variant }) =>
    $variant === "success" &&
    css`
      color: #059669;
      border-color: #a7f3d0;
      &:hover {
        background: #ecfdf5;
        border-color: #059669;
      }
    `}
`;

// ... Paginación (sin cambios mayores, solo mantener consistencia) ...
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  border-radius: 0 0 12px 12px;
`;

export const PageInfo = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

export const PaginationButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background};
  }
  
  &:not(:disabled):hover {
     background: ${({ theme }) => theme.colors.background};
  }
`;