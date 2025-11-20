// src/modules/machines/Machines.styles.ts
import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
`;

// --- Layout General ---

export const Container = styled.div`
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f8fafc; /* Slate 50 */
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// --- Header ---

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 8px;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  color: #0f172a; /* Slate 900 */
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

export const SubTitle = styled.p`
  margin: 12px 0 0 0;
  font-size: 15px;
  color: #64748b; /* Slate 500 */
  max-width: 600px;
  line-height: 1.6;
`;

export const ListSummary = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  span {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 9999px;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    display: flex;
    align-items: center;
    gap: 6px;
    
    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #cbd5e1;
    }

    &:nth-child(2)::before { background-color: #10b981; } /* Green for active */
    &:nth-child(3)::before { background-color: #ef4444; } /* Red for inactive */
  }
`;

// --- Botones ---

export const Button = styled.button`
  padding: 12px 24px;
  background: #0f172a; /* Dark modern button */
  color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06);
  transition: all 0.2s ease;

  &::before {
    content: "+";
    font-size: 18px;
    font-weight: 400;
  }

  &:hover {
    transform: translateY(-2px);
    background: #1e293b;
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.15), 0 4px 6px -2px rgba(15, 23, 42, 0.05);
  }

  &:active {
    transform: translateY(0);
  }
`;

// --- Filtros ---

export const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: minmax(300px, 2fr) 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 8px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.01), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

export const FiltersRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }

  input {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #cbd5e1;
    border-radius: 5px;
    background: white;
    cursor: pointer;
    position: relative;

    &:checked {
      background: #2563eb;
      border-color: #2563eb;
      
      &::after {
        content: '✔';
        font-size: 12px;
        color: white;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
`;

const FilterButtonBase = styled.button`
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

export const SortDirButton = styled(FilterButtonBase)`
  background: #f1f5f9;
  border: 1px solid transparent;
  color: #475569;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

export const ResetFiltersButton = styled(FilterButtonBase)`
  background: transparent;
  border: 1px dashed #cbd5e1;
  color: #64748b;

  &:hover {
    border-color: #94a3b8;
    color: #ef4444;
    background: #fef2f2;
  }
`;

// --- Tarjeta de Máquina (MachineCard) ---

export const MachineList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 8px;
`;

export const MachineCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;

  /* Borde de estado a la izquierda */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${(props: any) => (props['data-active'] ? '#10b981' : '#cbd5e1')};
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    border-color: #e2e8f0;
    
    &::before {
      opacity: 1;
    }
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const MachineMain = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MachineName = styled.h3`
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SmallText = styled.div`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  background: #f8fafc;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
  
  strong { color: #334155; }
`;

export const SecondaryLine = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    
    svg { width: 14px; height: 14px; }
  }
`;

// --- Stats Grid dentro de la Card ---

export const InfoList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
`;

export const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;

  span:first-child { /* Label */
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    font-weight: 600;
  }

  span:last-child { /* Value */
    font-size: 16px;
    font-weight: 700;
    color: #334155;
  }
`;

// --- Tags e Indicadores ---

export const TagRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

export const Tag = styled.span`
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
`;

export const StatusTag = styled.span<{ $active: boolean }>`
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ $active }) => ($active ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.08)")};
  color: ${({ $active }) => ($active ? "#059669" : "#b91c1c")};
  border: 1px solid ${({ $active }) => ($active ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)")};
  
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
    box-shadow: ${({ $active }) => ($active ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none")};
  }
`;

// --- Botones de Acción en Card ---

export const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
`;

export const IconButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #0f172a;
    transform: translateY(-1px);
  }
`;

export const PrimaryActionButton = styled(IconButton)`
  background: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
  flex: 1.5;

  &:hover {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }
`;

export const DangerousButton = styled(IconButton)`
  flex: 0 0 auto;
  color: #ef4444;
  background: #fff;
  border-color: #fee2e2;

  &:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
  }
`;

// --- Estados Vacíos y Carga ---

export const LoadingText = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  font-size: 16px;
  font-weight: 500;
  background: white;
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
`;

export const EmptyState = styled.div`
  grid-column: 1 / -1;
  background: white;
  border-radius: 24px;
  padding: 64px;
  text-align: center;
  border: 1px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p {
    font-size: 16px;
    color: #64748b;
    margin: 0;
  }

  button {
    margin-top: 8px;
    padding: 10px 20px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
`;

export const ErrorBox = styled.div`
  grid-column: 1 / -1;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
`;

// --- Inputs (Formularios) ---

const inputStyles = css`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.2s ease;
  font-family: inherit;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
  }
`;

export const TextInput = styled.input`
  ${inputStyles}
`;

export const SelectInput = styled.select`
  ${inputStyles}
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  appearance: none;
`;

export const TextArea = styled.textarea`
  ${inputStyles}
  min-height: 100px;
  resize: vertical;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

export const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
  margin-top: 4px;
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
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 24px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
`;

export const CloseIconButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    transform: rotate(90deg);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
`;

export const BaseButton = styled.button`
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

export const CancelButton = styled(BaseButton)`
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }
`;

export const SubmitButton = styled(BaseButton)`
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);

  &:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.3);
  }
`;

export const InlineInfoPill = styled.div`
  display: inline-flex;
  padding: 6px 12px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #bae6fd;
`;

// Exports necesarios para mantener compatibilidad pero que no se usan visualmente igual
export const ListHeaderRow = styled.div`display: none;`;