import styled, { keyframes, css } from "styled-components";

// --- Animaciones ---
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout Principal ---
export const Page = styled.div`
  padding: 32px 40px;
  background-color: #f8fafc; /* Slate 50 */
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// --- Encabezados ---
export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

export const Sub = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
`;

// --- Status Badges ---
export const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  ${(p) => {
    switch (p.status) {
      case "ok":
        return css`background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;`;
      case "warning":
        return css`background: #fffbeb; color: #d97706; border: 1px solid #fcd34d;`;
      case "critical":
        return css`background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;`;
      default:
        return css`background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;`;
    }
  }}
`;

// --- Contenedores de Gráficos ---

// Contenedor de una Categoría (ej: Vibración)
export const CategorySection = styled.section`
  margin-bottom: 40px;
`;

export const CategoryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
`;

// Grid para poner los gráficos uno al lado del otro
export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// Tarjeta individual de gráfico
export const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    border-color: #e2e8f0;
  }
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .current-value {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    font-feature-settings: "tnum";
    line-height: 1;
  }
`;

// --- Secciones de Información (Listas) ---
export const InfoSection = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }
`;

export const CodeBox = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
`;