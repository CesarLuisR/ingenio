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
  background-color: #f8fafc; /* Slate 50 */
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
  border-bottom: 1px solid #e2e8f0;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

export const Button = styled.button`
  padding: 12px 24px;
  background: #2563eb;
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
    background: #1d4ed8;
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
  background: white;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

const inputStyles = css`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  &:hover { border-color: #94a3b8; }
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
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #f1f5f9;
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
    border-color: #e2e8f0;
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
  color: #1e293b;
  margin: 0 0 4px 0;
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  background: ${({ $active }) => $active ? "#ecfdf5" : "#f1f5f9"};
  color: ${({ $active }) => $active ? "#059669" : "#64748b"};
  border: 1px solid ${({ $active }) => $active ? "#a7f3d0" : "#e2e8f0"};
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  p {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;

    /* Iconos simulados */
    &::before { 
      font-size: 16px; 
      color: #94a3b8;
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: ${({ $danger }) => $danger ? "#fff" : "#f8fafc"};
  color: ${({ $danger }) => $danger ? "#ef4444" : "#334155"};
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

  ${({ $danger }) => !$danger && css`
    &:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }
  `}
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: #94a3b8;
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
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  border: 1px solid #e2e8f0;
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 24px 0;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  &:hover { color: #475569; transform: rotate(90deg); transition: 0.2s; }
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
  color: #334155;
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
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  cursor: pointer;
  transition: 0.2s;

  &:hover { background: #f8fafc; color: #1e293b; border-color: #94a3b8; }
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: 0.2s;

  &:hover { background: #1d4ed8; transform: translateY(-1px); }
`;