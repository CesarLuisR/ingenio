import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalSlide = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout Principal ---
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
`;

export const Button = styled.button`
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 8px 12px -2px rgba(37, 99, 235, 0.3);
  }
  &:active { transform: translateY(0); }
`;

// --- Tabla Estilizada ---
export const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

export const TableHead = styled.thead`
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

export const TableHeader = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
`;

export const TableBody = styled.tbody`
  background-color: white;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;

  &:last-child { border-bottom: none; }
  &:hover { background-color: #f8fafc; }
`;

export const TableCell = styled.td`
  padding: 16px 24px;
  color: #334155;
  vertical-align: middle;
`;

export const UserName = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 15px;
`;

export const RoleBadge = styled.span<{ role: string }>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${({ role }) => {
    switch (role) {
      case 'admin':
      case 'SUPERADMIN':
        return css`background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe;`;
      case 'technician':
      case 'TECNICO':
        return css`background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;`;
      default: // viewer
        return css`background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;`;
    }
  }}
`;

// --- Acciones ---
export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;

  ${({ $danger }) =>
    $danger
      ? css`
          background: #fff;
          color: #ef4444;
          border-color: #fecaca;
          &:hover { background: #fef2f2; border-color: #f87171; }
        `
      : css`
          background: #fff;
          color: #3b82f6;
          border-color: #bfdbfe;
          &:hover { background: #eff6ff; border-color: #60a5fa; }
        `}
`;

// --- Loading ---
export const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  font-size: 16px;
`;

// --- MODAL ---
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
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalSlide} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
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
  color: #334155;
`;

const inputStyles = css`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const Input = styled.input`${inputStyles}`;
export const Select = styled.select`${inputStyles}; cursor: pointer;`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #f1f5f9; color: #1e293b; }
`;

export const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;

  &:hover { background: #1d4ed8; transform: translateY(-1px); }
`;