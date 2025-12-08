import styled, { keyframes, css } from "styled-components";

// --- Animaciones ---
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout Principal ---
export const Page = styled.div`
  padding: 32px 40px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// --- Encabezados de Página ---
export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap; 
  gap: 16px;
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const Sub = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  margin: 0;
  font-weight: 500;
`;

// --- Secciones de Categoría ---
export const CategorySection = styled.section`
  margin-bottom: 40px;
`;

export const CategoryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

// --- Grid de Gráficos ---
export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// --- Tarjeta de Gráfico (Card Inteligente) ---
// Recibe $status para cambiar el borde de color si hay alerta
export const ChartCard = styled.div<{ $status?: string }>`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  /* Lógica de Borde y Sombra Dinámica */
  border: 1px solid ${({ $status, theme }) => {
    if ($status === 'critical') return '#fecaca'; // Rojo suave
    if ($status === 'warning') return '#fcd34d'; // Amarillo suave
    return theme.colors.border; // Gris normal
  }};
  
  box-shadow: ${({ $status }) => {
    if ($status === 'critical') return '0 4px 12px rgba(220, 38, 38, 0.1)';
    if ($status === 'warning') return '0 4px 12px rgba(217, 119, 6, 0.1)';
    return '0 4px 6px -1px rgba(0, 0, 0, 0.02)';
  }};

  /* Indicador lateral de color sólido */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $status }) => {
    if ($status === 'critical') return '#dc2626';
    if ($status === 'warning') return '#d97706';
    return 'transparent';
  }};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }
`;

export const ChartFooter = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// --- Header Interno de la Métrica ---
export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .current-value {
    font-size: 28px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1;
    font-feature-settings: "tnum";
    display: flex;
    align-items: baseline;
  }
`;

// --- Badge de Estado ---
export const StatusBadge = styled.span<{ $status?: string }>`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;

  ${({ $status, theme }) => {
    if ($status === 'critical') return css`background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;`;
    if ($status === 'warning') return css`background: #fffbeb; color: #d97706; border: 1px solid #fcd34d;`;
    if ($status === 'ok') return css`background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;`;

    // Default / Unknown / Inactive
    return css`
      background: ${theme.colors.background}; 
      color: ${theme.colors.text.secondary}; 
      border: 1px solid ${theme.colors.border};
    `;
  }}
`;

// --- Elementos adicionales (Legacy/Utilidad) ---
export const InfoSection = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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

// --- KPI Cards (SensorMetrics) ---
export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

export const KpiCardStyled = styled.div<{ $clickable?: boolean }>`
  background: ${({ theme }) => theme.colors.card};
  padding: 20px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: transform 0.1s ease-in-out;

  &:hover {
    transform: ${({ $clickable }) => ($clickable ? "translateY(-2px)" : "none")};
  }
`;

export const KpiLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  text-transform: uppercase;
`;

export const KpiValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const KpiValue = styled.span<{ $color?: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
`;

export const KpiDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

// --- Failures List (SensorFailures) ---
export const FailuresList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

export const FailureItem = styled.li`
  padding: 0.9rem 1rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fff7f7'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'};
`;

export const FailureTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fca5a5' : '#991b1b'};
  font-size: 1rem;
`;

export const FailureMeta = styled.div`
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  
  b {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;