// src/modules/machines/Machines.styles.ts
import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout General ---

export const Container = styled.div`
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1600px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  font-family: 'Inter', sans-serif;

  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    padding: 24px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
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
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

export const SubTitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  line-height: 1.6;
  font-weight: 500;
`;

export const ListSummary = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  span {
    background: ${({ theme }) => theme.colors.card};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 9999px;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    display: flex;
    align-items: center;
    gap: 6px;
    
    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.text.tertiary};
    }

    &:nth-child(2)::before { background-color: #10b981; } /* Green */
    &:nth-child(3)::before { background-color: #ef4444; } /* Red */
  }
`;

// --- Botones Principales ---

export const Button = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.accent.primary}; /* Oscuro */
  color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &::before {
    content: "+";
    font-size: 18px;
    font-weight: 400;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover}; /* Oscuro */
    transform: translateY(-2px);
    opacity: 0.95;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SearchButton = styled.button`
  background-color: ${({ theme }) => theme.colors.accent.primary}; /* Azul Sólido */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 6px 10px -1px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

// --- Filtros ---

export const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: minmax(300px, 2fr) 1fr auto auto; /* Ajustado para incluir el botón de buscar */
  gap: 16px;
  align-items: center;
  padding: 8px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.01);

  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    grid-template-columns: 1fr 1fr;
    padding: 16px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
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
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  input {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: 5px;
    background: ${({ theme }) => theme.colors.card};
    cursor: pointer;
    position: relative;

    &:checked {
      background: ${({ theme }) => theme.colors.accent.primary};
      border-color: ${({ theme }) => theme.colors.accent.primary};
      
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
  background: ${({ theme }) => theme.colors.card}; /* Antes era background, ahora card (blanco) */
  border: 1px solid ${({ theme }) => theme.colors.border}; /* Con borde para que se note */
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const ResetFiltersButton = styled(FilterButtonBase)`
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.tertiary};

  &:hover {
    border-color: #fca5a5;
    color: #ef4444;
    background: #fef2f2;
  }
`;

// --- Tarjeta de Máquina (MachineCard) ---

export const MachineList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
  gap: 24px;
  margin-top: 8px;
`;

export const MachineCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
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
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    border-color: ${({ theme }) => theme.colors.text.tertiary};
    
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
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SmallText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  strong { color: ${({ theme }) => theme.colors.text.primary}; }
`;

export const SecondaryLine = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
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
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
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
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-weight: 600;
  }

  span:last-child { /* Value */
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
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
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const StatusTag = styled.span<{ $active: boolean }>`
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ $active }) => ($active ? "#ecfdf5" : "#fef2f2")};
  color: ${({ $active }) => ($active ? "#059669" : "#b91c1c")};
  border: 1px solid ${({ $active }) => ($active ? "#a7f3d0" : "#fecaca")};
  
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
  }
`;

// --- Botones de Acción en Card ---

export const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

export const IconButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.text.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateY(-1px);
  }
`;

// Este botón era el "blanco". Ahora es azul sólido.
export const PrimaryActionButton = styled(IconButton)`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: 1px solid transparent;
  flex: 1.5;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.primary}; /* Mantener azul */
    opacity: 0.9;
    color: white;
    border-color: transparent;
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

// --- Paginación ---

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.colors.card}; /* Fondo blanco para que no se vea sucio */
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
`;

export const PageInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }
`;

export const NavButton = styled.button`
  padding: 8px 14px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.text.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

// --- Estados Vacíos y Carga ---

export const LoadingText = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 16px;
  font-weight: 500;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

export const EmptyState = styled.div`
  grid-column: 1 / -1;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  padding: 64px;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }

  button {
    margin-top: 8px;
    padding: 10px 20px;
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.border};
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
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.tertiary};
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
  color: ${({ theme }) => theme.colors.text.primary};
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
  background: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 3px; }
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 24px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CloseIconButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: rotate(90deg);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
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
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.text.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Exports de compatibilidad
export const ListHeaderRow = styled.div`display: none;`;

export const Select = styled.select`
  ${inputStyles}
  cursor: pointer;
  appearance: none;
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

export const SubmitButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.3);
  }
`; 