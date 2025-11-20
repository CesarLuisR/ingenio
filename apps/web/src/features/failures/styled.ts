import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout Principal ---
export const Container = styled.div`
  padding: 32px 40px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8fafc;
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
  background: #dc2626; /* Rojo para indicar urgencia en reportar */
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3);
  }
  &:active { transform: translateY(0); }
`;

// --- Filtros ---
export const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #dc2626;
    background: white;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
`;

export const SelectInput = styled.select`${inputStyles}; cursor: pointer;`;
export const TextInput = styled.input`${inputStyles}`;

// --- Lista de Fallas ---
export const FailureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

export const FailureCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  /* Borde rojo a la izquierda */
  border-left: 4px solid #ef4444;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

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
`;

export const SensorName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const EditButton = styled.button`
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: 0.2s;
  
  &:hover { background: #f1f5f9; color: #0f172a; }
`;

// --- Tags ---
export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const badgeBase = css`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const SeverityTag = styled.span<{ $sev: string }>`
  ${badgeBase};
  ${({ $sev }) => {
    switch($sev) {
      case "Crítica": return css`background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;`;
      case "Alta": return css`background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa;`;
      case "Media": return css`background: #fefce8; color: #a16207; border: 1px solid #fef08a;`;
      default: return css`background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;`;
    }
  }}
`;

export const StatusTag = styled.span<{ $sts: string }>`
  ${badgeBase};
  ${({ $sts }) => {
    switch($sts) {
      case "resuelta": return css`background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;`;
      case "en reparación": return css`background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;`;
      default: return css`background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;`;
    }
  }}
`;

export const Description = styled.p`
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
  margin: 0;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;

  p { margin: 0; display: flex; align-items: center; gap: 6px; }
  strong { color: #334155; font-weight: 600; }
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  font-size: 16px;
`;

// --- MODAL ---
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
`;

export const CloseIconButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  transition: 0.2s;
  &:hover { color: #475569; transform: rotate(90deg); }
`;

// --- FORM ---
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

export const TextArea = styled.textarea`
  ${inputStyles};
  min-height: 100px;
  resize: vertical;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 24px;
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
  &:hover { background: #f8fafc; color: #1e293b; }
`;

export const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
  &:hover { background: #b91c1c; }
`;