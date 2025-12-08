import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  padding: 32px 40px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 32px;
  font-family: 'Inter', sans-serif;

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
  flex-wrap: wrap;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-family: 'Inter', sans-serif;
`;

export const SubTitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  line-height: 1.6;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
`;

export const SelectionPanel = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${fadeIn} 0.3s ease-out;
`;

/* --- Historial Tabla --- */

export const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

export const TableHeader = styled.div`
  display: flex;
  padding: 16px 24px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const TableRow = styled.div<{ $expanded: boolean }>`
  display: flex;
  padding: 16px 24px;
  cursor: pointer;
  background: ${({ $expanded, theme }) =>
    $expanded ? theme.colors.background : theme.colors.card};
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const Cell = styled.div`
  flex: 1;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const StatusBadge = styled.span<{ $type: string }>`
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;

  ${({ $type }) => {
    if ($type === "danger") return css`
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fecaca;
    `;
    if ($type === "warning") return css`
      background: #fffbeb;
      color: #f59e0b;
      border: 1px solid #fcd34d;
    `;
    if ($type === "success") return css`
      background: #ecfdf5;
      color: #10b981;
      border: 1px solid #a7f3d0;
    `;
    return css`
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    `;
  }}
`;

export const ExpandButton = styled.button<{ $expanded: boolean }>`
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
`;

export const ExpandedContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
  animation: ${fadeIn} 0.2s ease;
  display: grid;
  gap: 24px;
`;

export const EmptyStateTable = styled.div`
  padding: 48px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

/* --- Sensor Card --- */

export const ReportCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ReportHeader = styled.div`
  padding: 14px 20px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  h2 {
    font-size: 16px;
    margin: 0;
  }
`;

export const CollapseButton = styled.button<{ $open: boolean }>`
  width: 30px;
  height: 30px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
`;

export const CollapseContent = styled.div`
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ReportBody = styled.div`
  display: grid;
  gap: 24px;
`;

export const MetricGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const GroupTitle = styled.h3`
  font-size: 13px;
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.tertiary};
  display: flex;
  gap: 8px;
  align-items: center;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

export const MetricsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`;

export const MetricCard = styled.div<{ $urgency: string }>`
  padding: 16px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  border-top: 4px solid
    ${({ $urgency }) =>
    $urgency === "alta" || $urgency === "fuera"
      ? "#ef4444"
      : $urgency === "moderada"
        ? "#f59e0b"
        : "#10b981"};
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const MetricName = styled.h4`
  font-size: 15px;
  margin: 0;
`;

export const UrgencyBadge = styled.span<{ $urgency: string }>`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;

  ${({ $urgency }) => {
    if ($urgency === "alta" || $urgency === "fuera") return css`
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    `;
    if ($urgency === "moderada") return css`
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fcd34d;
    `;
    return css`
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    `;
  }}
`;

export const AnalysisText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const StatsRow = styled.div`
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 16px;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;

  span:first-child {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  span:last-child {
    font-size: 14px;
    font-weight: 700;
  }
`;

export const ChartWrapper = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ChartContainer = styled.div`
  width: 100%;
  height: 250px;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
    
    button {
      width: 100%;
    }
  }
`;

export const ActionButton = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
  white-space: normal;
  text-align: center;
  line-height: 1.2;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
    box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.text.tertiary};
    box-shadow: none;
  }
`;