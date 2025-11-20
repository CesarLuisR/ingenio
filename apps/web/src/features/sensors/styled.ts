import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
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
  background-color: #f8fafc; /* Slate 50 */
  font-family: 'Inter', sans-serif;

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

// --- Toolbar de Filtros ---
export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
  padding: 12px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 240px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background: #fff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const Select = styled.select`
  padding: 10px 36px 10px 16px; /* Espacio extra para la flecha custom si se usara */
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 10px;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${(p) => (p.$active ? "#ffffff" : "transparent")};
  color: ${(p) => (p.$active ? "#0f172a" : "#64748b")};
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0,0,0,0.1)" : "none")};

  &:hover {
    color: #0f172a;
  }
`;

export const ActionButton = styled.button`
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: transform 0.1s, box-shadow 0.2s;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  }
`;

// --- Grid y Cards ---
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
`;

export const Card = styled.div<{ $isActive: boolean }>`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.4s ease-out;
  cursor: pointer;

  /* Indicador lateral de estado */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: ${(p) => (p.$isActive ? "#10b981" : "#cbd5e1")};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    border-color: #e2e8f0;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const CardTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;

export const CardSubtitle = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  svg { width: 14px; height: 14px; }
`;

export const Badge = styled.span<{ $status: string }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background: ${(p) =>
    p.$status === "active" ? "#ecfdf5" : p.$status === "inactive" ? "#fef2f2" : "#f1f5f9"};
  color: ${(p) =>
    p.$status === "active" ? "#059669" : p.$status === "inactive" ? "#b91c1c" : "#64748b"};
  border: 1px solid ${(p) =>
    p.$status === "active" ? "#a7f3d0" : p.$status === "inactive" ? "#fecaca" : "#e2e8f0"};
`;

// --- Métricas dentro de la Card ---
export const CardStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
`;

export const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;

  span:first-child { /* Label */
    font-size: 10px;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  span:last-child { /* Value */
    font-size: 14px;
    font-weight: 700;
    color: #334155;
  }
`;

export const LastReadingText = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
  text-align: right;
  font-style: italic;
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
`;

export const GhostButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

export const DangerTextButton = styled(GhostButton)`
  color: #ef4444;
  &:hover {
    background: #fef2f2;
    color: #b91c1c;
  }
`;

export const Loading = styled.div`
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

// --- MODAL & FORMULARIOS ---

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
  max-width: 600px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;

  /* Scrollbar elegante */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
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

export const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  &:read-only {
    background: #f1f5f9;
    color: #64748b;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
`;

export const BaseButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
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

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }
`;

export const SubmitButton = styled(BaseButton)`
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
`;

// --- EDITOR DE CONFIGURACIÓN (MetricsConfigEditor) ---

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

export const EditorHeader = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const GroupCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
`;

export const GroupHeader = styled.div`
  background: #f1f5f9;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
`;

export const GroupTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
`;

export const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;

  &:last-child { border-bottom: none; }
  
  strong { color: #0f172a; margin-right: auto; }
`;

export const MetricControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const MetricsLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
`;

export const InputField = styled.input`
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
  text-align: right;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const SmallButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
`;

export const AddButton = styled(SmallButton)`
  background: #dbeafe;
  color: #1e40af;
  &:hover { background: #bfdbfe; }
`;

export const MetricsButton = styled(SmallButton)`
  background: #0f172a;
  color: white;
  &:hover { opacity: 0.9; }
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
`;