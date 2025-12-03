import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- LAYOUT GENERAL ---
export const Container = styled.div`
  padding: 32px 40px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  font-family: "Inter", sans-serif;
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
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.03em;
`;

// --- BOTONES ---
export const Button = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.accent.primary};
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
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
    box-shadow: 0 8px 12px -2px rgba(37, 99, 235, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
`;

export const ImportButton = styled(Button)`
  background: ${({ theme }) => theme.colors.card};
  color: #059669;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: ${({ theme }) => theme.colors.background};
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
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

// --- TARJETAS DE MANTENIMIENTO ---
export const MaintenanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MachineGroupHeader = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 24px 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

export const MaintenanceCard = styled.div<{ $type: string }>`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border-left: 4px solid
    ${({ $type }) =>
    $type === "Correctivo"
      ? "#ef4444"
      : $type === "Predictivo"
        ? "#8b5cf6"
        : "#22c55e"};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
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
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const DateText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 2px;
`;

export const EditButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.text.tertiary};
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
    $type === "Correctivo"
      ? "#fef2f2"
      : $type === "Predictivo"
        ? "#f5f3ff"
        : "#f0fdf4"};
  color: ${({ $type }) =>
    $type === "Correctivo"
      ? "#b91c1c"
      : $type === "Predictivo"
        ? "#6d28d9"
        : "#15803d"};
  border: 1px solid
    ${({ $type }) =>
    $type === "Correctivo"
      ? "#fecaca"
      : $type === "Predictivo"
        ? "#ddd6fe"
        : "#bbf7d0"};
`;

export const SimpleTag = styled.span`
  ${badgeBase};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

// --- INFO GRID ---
export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;

  span:first-child {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-weight: 600;
    text-transform: uppercase;
  }
  span:last-child {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.primary};
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
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CloseIconButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
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
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const inputStyles = css`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)'};
  }
  &:hover {
    border-color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const TextInput = styled.input`
  ${inputStyles}
`;
export const NumberInput = styled.input.attrs({ type: "number" })`
  ${inputStyles}
`;
export const SelectInput = styled.select`
  ${inputStyles}
`;
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
  border-top: 1px solid ${({ theme }) => theme.colors.border};
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
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const SubmitButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
  }
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 16px;
`;

// --- REPORTE DE IMPORTACIÓN ---
export const ReportContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const ReportStats = styled.div`
  display: flex;
  gap: 12px;
`;

export const StatBadge = styled.span<{ $type: "success" | "error" | "info" }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${({ $type }) =>
    $type === "success" &&
    css`
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    `}
  ${({ $type }) =>
    $type === "error" &&
    css`
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    `}
  ${({ $type }) =>
    $type === "info" &&
    css`
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
    `}
`;

export const ReportContent = styled.div`
  max-height: 250px;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

export const LogRow = styled.div<{ $type: "success" | "error" }>`
  padding: 10px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ $type, theme }) => ($type === "error" ? "#fff5f5" : theme.colors.card)};

  &:last-child {
    border-bottom: none;
  }
`;

export const ReportActions = styled.div`
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.card};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const ActionButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;

  ${({ $variant, theme }) =>
    $variant === "primary"
      ? css`
          background: ${theme.colors.card};
          border-color: ${theme.colors.border};
          color: ${theme.colors.text.secondary};
          &:hover {
            background: ${theme.colors.background};
            border-color: ${theme.colors.text.tertiary};
          }
        `
      : css`
          background: transparent;
          border-color: transparent;
          color: ${theme.colors.text.secondary};
          &:hover {
            color: #dc2626;
            background: #fef2f2;
          }
        `}
`;

// --- PAGINACIÓN ---
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
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.text.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }

  .total {
    margin-left: 8px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-size: 0.85em;
  }
`;

export const FailuresList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background};
`;

export const FailureItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  
  input {
    cursor: pointer;
  }
`;

export const EmptyState = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
`;

// --- TABLA PROFESIONAL ---
export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto; /* Permite scroll horizontal en móviles */
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px; /* Asegura que no se aplaste en pantallas pequeñas */
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

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background}; /* Color sutil al pasar el mouse */
  }
`;

export const Td = styled.td`
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: middle;

  &.strong {
    font-weight: 600;
  }
  
  &.numeric {
    font-family: 'JetBrains Mono', 'Fira Code', monospace; /* Fuente monoespaciada para números */
    font-size: 13px;
  }

  &.actions {
    text-align: right;
  }
`;

// Reutilizamos tu TypeTag pero lo ajustamos ligeramente si es necesario
// (Puedes mantener el que ya tenías, funciona bien en tablas)