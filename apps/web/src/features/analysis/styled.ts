import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const SelectInput = styled.select`
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary}; /* Slate 700 */
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border}; /* Slate 200 */
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease-in-out;
  appearance: none; /* Elimina el estilo nativo del SO */
  cursor: pointer;

  /* Icono de flecha custom (opcional, para que se vea mejor que el nativo) */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem; /* Espacio para la flecha */

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.text.tertiary}; /* Slate 300 */
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary}; /* Blue 500 */
    box-shadow: 0 0 0 3px ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background}; /* Slate 100 */
    color: ${({ theme }) => theme.colors.text.tertiary}; /* Slate 400 */
    cursor: not-allowed;
  }
`;

// --- Layout ---
export const Container = styled.div`
  padding: 32px 40px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const Header = styled.div`
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
  letter-spacing: -0.03em;
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 15px;
  margin: 0;
`;

// --- Panel de Selección ---
export const SelectionPanel = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 32px;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 3px; }
`;

export const CheckboxLabel = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ $checked, theme }) => $checked ? theme.colors.accent.primary : theme.colors.border};
  background-color: ${({ $checked, theme }) => $checked ? (theme.mode === 'dark' ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff') : theme.colors.card};

  &:hover {
    background-color: ${({ $checked, theme }) => $checked ? (theme.mode === 'dark' ? 'rgba(37, 99, 235, 0.3)' : '#dbeafe') : theme.colors.background};
    border-color: ${({ $checked, theme }) => $checked ? theme.colors.accent.hover : theme.colors.text.tertiary};
  }

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.accent.primary};
    cursor: pointer;
  }
`;

export const ActionButton = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.text.tertiary};
    box-shadow: none;
  }
`;

// --- Resultados ---
export const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
`;

export const ReportCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const ReportHeader = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const ReportBody = styled.div`
  padding: 24px;
  display: grid;
  gap: 32px;
`;

// --- Métricas ---
export const MetricGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const GroupTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

export const MetricsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

export const MetricCard = styled.div<{ $urgency: string }>`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  /* Borde superior de color según urgencia */
  border-top: 4px solid ${({ $urgency }) =>
    $urgency.includes("fuera") || $urgency.includes("alta") ? '#ef4444' :
      $urgency === 'moderada' ? '#f59e0b' : '#10b981'};

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
    transform: translateY(-2px);
  }
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const MetricName = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const AnalysisText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

export const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;

  span:first-child {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-weight: 600;
    text-transform: uppercase;
  }
  span:last-child {
    font-size: 15px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const TrendIcon = styled.span<{ $trend: string }>`
  font-size: 16px;
  display: flex;
  align-items: center;
  color: ${({ $trend, theme }) =>
    $trend === 'subiendo' ? '#ef4444' :
      $trend === 'bajando' ? '#10b981' : theme.colors.text.secondary};
`;

// --- Gráficos ---
export const ChartWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ChartContainer = styled.div`
  height: 280px;
  width: 100%;
`;

// --- Badges ---
export const UrgencyBadge = styled.span<{ $urgency: string }>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${({ $urgency }) => {
    if ($urgency.includes("fuera") || $urgency.includes("alta"))
      return css`background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;`;
    if ($urgency === "moderada")
      return css`background: #fffbeb; color: #b45309; border: 1px solid #fcd34d;`;
    return css`background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;`;
  }}
`;