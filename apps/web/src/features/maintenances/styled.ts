import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- LAYOUT GENERAL ---
export const Container = styled.div`
  padding: 32px 40px;
  background-color: #f8fafc; /* Slate 50 */
  min-height: 100vh;
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
  flex-wrap: wrap;
  gap: 16px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.03em;
`;

// --- BOTONES ---
export const Button = styled.button`
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 8px 12px -2px rgba(37, 99, 235, 0.3);
  }
  &:active { transform: translateY(0); }
`;

export const ImportButton = styled(Button)`
  background: white;
  color: #059669;
  border: 1px solid #d1fae5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  &:hover {
    background: #ecfdf5;
    border-color: #10b981;
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
  }
`;

// --- FILTROS ---
export const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

// --- TARJETAS DE MANTENIMIENTO ---
export const MaintenanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Group Header (Máquina)
export const MachineGroupHeader = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 24px 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
`;

export const MaintenanceCard = styled.div<{ $type: string }>`
  background: white;
  border-radius: 12px;
  /* Borde izquierdo de color según el tipo */
  border-left: 4px solid ${({ $type }) => 
    $type === 'Correctivo' ? '#ef4444' : 
    $type === 'Predictivo' ? '#8b5cf6' : '#22c55e'};
  border-right: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const CardTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SensorName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const DateText = styled.span`
  font-size: 13px;
  color: #94a3b8;
  margin-top: 2px;
`;

export const EditButton = styled.button`
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }
`;

// --- TAGS ---
export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const badgeBase = css`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

export const TypeTag = styled.span<{ $type: string }>`
  ${badgeBase};
  background-color: ${({ $type }) =>
    $type === "Correctivo" ? "#fef2f2" :
    $type === "Predictivo" ? "#f5f3ff" : "#f0fdf4"};
  color: ${({ $type }) =>
    $type === "Correctivo" ? "#b91c1c" :
    $type === "Predictivo" ? "#6d28d9" : "#15803d"};
  border: 1px solid ${({ $type }) =>
    $type === "Correctivo" ? "#fecaca" :
    $type === "Predictivo" ? "#ddd6fe" : "#bbf7d0"};
`;

export const SimpleTag = styled.span`
  ${badgeBase};
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
`;

// --- INFO GRID ---
export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  
  span:first-child {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
  }
  span:last-child {
    font-size: 14px;
    color: #334155;
    font-weight: 500;
  }
`;

export const NoteBox = styled.div`
  background: #fefce8;
  border: 1px solid #fef08a;
  color: #854d0e;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  font-style: italic;
`;

// --- MODAL ---
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

export const CloseIconButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  &:hover { color: #475569; }
`;

// --- FORMULARIOS ---
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

const inputStyles = css`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  &:hover {
    border-color: #94a3b8;
  }
`;

export const TextInput = styled.input`${inputStyles}`;
export const NumberInput = styled.input.attrs({ type: "number" })`${inputStyles}`;
export const SelectInput = styled.select`${inputStyles}`;
export const TextArea = styled.textarea`
  ${inputStyles};
  min-height: 80px;
  resize: vertical;
`;

export const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
`;

// --- BOTONES FORM ---
export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

export const BaseButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
`;

export const CancelButton = styled(BaseButton)`
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  &:hover { background: #f1f5f9; color: #1e293b; }
`;

export const SubmitButton = styled(BaseButton)`
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  &:hover { background: #1d4ed8; transform: translateY(-1px); }
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 16px;
`;

// --- ESTILOS PARA EL REPORTE DE IMPORTACIÓN ---

export const ReportContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const ReportStats = styled.div`
  display: flex;
  gap: 12px;
`;

export const StatBadge = styled.span<{ type: 'success' | 'error' | 'info' }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${({ type }) => type === 'success' && css`
    background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
  `}
  ${({ type }) => type === 'error' && css`
    background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;
  `}
  ${({ type }) => type === 'info' && css`
    background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe;
  `}
`;

export const ReportContent = styled.div`
  max-height: 250px;
  overflow-y: auto;
  padding: 0;
  
  /* Scrollbar bonita */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

export const LogRow = styled.div<{ type: 'success' | 'error' }>`
  padding: 10px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ type }) => type === 'error' ? '#fff5f5' : '#ffffff'};

  &:last-child { border-bottom: none; }
`;

export const ReportActions = styled.div`
  padding: 12px 20px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;

  ${({ variant }) => variant === 'primary' ? css`
    background: #ffffff;
    border-color: #cbd5e1;
    color: #475569;
    &:hover { background: #f8fafc; border-color: #94a3b8; }
  ` : css`
    background: transparent;
    border-color: transparent;
    color: #64748b;
    &:hover { color: #dc2626; background: #fef2f2; }
  `}
`;

// ... resto de tus estilos