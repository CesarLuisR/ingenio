import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout General ---
export const Container = styled.div`
  padding: 32px 40px;
  max-width: 100%; /* Ancho completo para la tabla */
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

export const Button = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  }
  &:active { transform: translateY(0); }
`;

// --- Filtros ---
export const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

const inputStyles = css`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => theme.colors.card};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)'};
  }
`;

export const SelectInput = styled.select`${inputStyles}; cursor: pointer;`;
export const TextInput = styled.input`${inputStyles};`;

// --- TABLA PROFESIONAL ---
export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  font-size: 14px;
`;

export const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

export const Th = styled.th`
  text-align: left;
  padding: 16px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

export const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;
  &:last-child { border-bottom: none; }
  &:hover { background-color: ${({ theme }) => theme.colors.background}; }
`;

export const Td = styled.td`
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: middle;

  &.strong { font-weight: 600; }
  &.numeric { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
  &.actions { text-align: right; }
  
  a {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  background: ${({ $active }) => $active ? "#dcfce7" : "#f1f5f9"};
  color: ${({ $active }) => $active ? "#15803d" : "#64748b"};
  border: 1px solid ${({ $active }) => $active ? "#bbf7d0" : "#e2e8f0"};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
  }
`;

// --- Botones de Acción (Tabla) ---
export const TableActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;

  ${({ $variant, theme }) => 
    $variant === 'delete' 
      ? css`
          color: #ef4444;
          &:hover { background: #fef2f2; border-color: #fca5a5; }
        `
      : css`
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.background}; color: ${theme.colors.text.primary}; border-color: ${theme.colors.text.tertiary}; }
        `
  }
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 16px;
`;

// --- Paginación ---
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 16px;
  padding-bottom: 40px;
`;

export const PaginationButton = styled.button`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  strong { color: ${({ theme }) => theme.colors.text.primary}; font-weight: 600; }
  .total { margin-left: 8px; color: ${({ theme }) => theme.colors.text.tertiary}; font-size: 0.85em; }
`;

// --- Modal y Formulario (Se mantienen igual) ---
export const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card}; border-radius: 16px; width: 100%; max-width: 500px; padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ModalTitle = styled.h2`
  font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.colors.text.primary}; margin: 0 0 24px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; padding-bottom: 16px;
`;

export const CloseButton = styled.button`
  position: absolute; top: 24px; right: 24px; background: transparent; border: none; color: ${({ theme }) => theme.colors.text.tertiary}; font-size: 24px; cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text.secondary}; transform: rotate(90deg); transition: 0.2s; }
`;

export const Form = styled.form`display: flex; flex-direction: column; gap: 20px;`;
export const FormGroup = styled.div`display: flex; flex-direction: column; gap: 8px;`;
export const Label = styled.label`font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.text.primary};`;
export const Input = styled.input`${inputStyles};`;
export const Select = styled.select`${inputStyles};`; // Simplificado para no requerir SVG inline si no se desea

export const ButtonGroup = styled.div`display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; padding-top: 20px; border-top: 1px solid ${({ theme }) => theme.colors.border};`;

export const CancelButton = styled.button`
  padding: 10px 20px; border-radius: 8px; font-weight: 600; background: ${({ theme }) => theme.colors.card}; border: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text.secondary}; cursor: pointer; transition: 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.background}; color: ${({ theme }) => theme.colors.text.primary}; }
`;

export const SubmitButton = styled.button`
  padding: 10px 20px; border-radius: 8px; font-weight: 600; background: ${({ theme }) => theme.colors.accent.primary}; color: white; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.accent.hover}; transform: translateY(-1px); }
`;