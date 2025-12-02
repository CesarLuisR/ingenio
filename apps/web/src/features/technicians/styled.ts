import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout General ---
export const Container = styled.div`
  padding: 32px 40px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background}; /* Slate 50 */
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
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 12px;
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
  margin-bottom: 32px;
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

const inputStyles = css`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
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
  &:hover { border-color: ${({ theme }) => theme.colors.text.tertiary}; }
`;

export const SelectInput = styled.select`
  ${inputStyles};
  cursor: pointer;
`;

export const TextInput = styled.input`
  ${inputStyles};
`;

// --- Lista de Técnicos (Grid) ---
export const TechnicianList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

export const TechnicianCard = styled.div<{ $active: boolean }>`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  /* Indicador lateral de estado */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $active }) => ($active ? "#10b981" : "#cbd5e1")};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05);
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const Name = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  background: ${({ $active, theme }) => $active ? "#ecfdf5" : theme.colors.background};
  color: ${({ $active, theme }) => $active ? "#059669" : theme.colors.text.secondary};
  border: 1px solid ${({ $active, theme }) => $active ? "#a7f3d0" : theme.colors.border};
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  p {
    margin: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.secondary};
    display: flex;
    align-items: center;
    gap: 8px;

    /* Iconos simulados */
    &::before { 
      font-size: 16px; 
      color: ${({ theme }) => theme.colors.text.tertiary};
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: ${({ $danger, theme }) => $danger ? theme.colors.card : theme.colors.background};
  color: ${({ $danger, theme }) => $danger ? "#ef4444" : theme.colors.text.primary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $danger }) => $danger && css`
    border-color: #fee2e2;
    &:hover {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #b91c1c;
    }
  `}

  ${({ $danger, theme }) => !$danger && css`
    &:hover {
      background: ${theme.colors.background};
      color: ${theme.colors.text.primary};
      border-color: ${theme.colors.border};
    }
  `}
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 16px;
`;

// --- Modal ---
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 24px 0;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 24px;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text.secondary}; transform: rotate(90deg); transition: 0.2s; }
`;

// --- Formulario ---
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Input = styled.input`
  ${inputStyles};
`;

export const Select = styled.select`
  ${inputStyles};
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

export const CancelButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: 0.2s;

  &:hover { background: ${({ theme }) => theme.colors.background}; color: ${({ theme }) => theme.colors.text.primary}; border-color: ${({ theme }) => theme.colors.text.tertiary}; }
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: 0.2s;

  &:hover { background: ${({ theme }) => theme.colors.accent.hover}; transform: translateY(-1px); }
`;