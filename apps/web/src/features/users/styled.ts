import styled, { css, keyframes } from "styled-components";

/* --- Animaciones --- */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalSlide = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* --- Layout Principal --- */
export const Container = styled.div`
  padding: 32px 40px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    padding: 24px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.02em;
`;

export const Button = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

/* --- Tabla Estilizada --- */
export const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

export const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TableHeader = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
`;

export const TableBody = styled.tbody`
  background-color: ${({ theme }) => theme.colors.card};
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;

  &:last-child { border-bottom: none; }
  &:hover { background-color: ${({ theme }) => theme.colors.background}; }
`;

export const TableCell = styled.td`
  padding: 16px 24px;
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: middle;
`;

export const UserName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
`;

/* --- Role Badge --- */
export const RoleBadge = styled.span<{ role: string }>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;

  ${({ role, theme }) => {
    switch (role) {
      case 'admin':
      case 'SUPERADMIN':
        return css`background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe;`;
      case 'technician':
      case 'TECNICO':
        return css`background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;`;

      default:
        return css`
          background: ${theme.mode === "dark" ? "#1e293b" : "#f1f5f9"};
          color: ${theme.mode === "dark" ? "#e2e8f0" : "#475569"};
          border: 1px solid ${theme.colors.border};
        `;
    }
  }}
`;

/* --- Acciones --- */
export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};

  ${({ $danger }) =>
    $danger
      ? css`
          color: #ef4444;
          &:hover { background: #fee2e2; }
        `
      : css`
          color: ${({ theme }) => theme.colors.accent.primary};
          &:hover { background: ${({ theme }) => theme.colors.background}; }
        `}
`;

/* --- Loading --- */
export const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/* --- MODAL --- */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
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
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalSlide} 0.3s ease-out;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

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

const inputStyles = css`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => theme.colors.card};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const Input = styled.input`${inputStyles}`;
export const Select = styled.select`${inputStyles}; cursor: pointer;`;

/* --- Botones del Modal --- */
export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
  }
`;

/* --- Paginación --- */
export const PaginationFooter = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-bottom: 30px;

  button {
    padding: 8px 16px;
    background: ${({ theme }) => theme.colors.card};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.secondary};
    border-radius: 6px;

    &:hover {
      background: ${({ theme }) => theme.colors.background};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  span {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

/* --- Toolbar --- */
export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    width: 100%;
    
    input {
      width: 100%;
      min-width: 0;
    }
  }
`;

export const TextInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 200px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`;
