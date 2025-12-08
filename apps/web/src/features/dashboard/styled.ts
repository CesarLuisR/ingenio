// src/pages/Dashboard/styled.ts
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
    padding: 2rem 3rem;
    background: ${({ theme }) => theme.colors.background};
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    animation: ${fadeIn} 0.5s ease-out;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
        padding: 1.5rem;
    }
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }
`;

export const Title = styled.h1`
    font-size: 2.25rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
    letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
`;

// Header right side container
export const HeaderActions = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
`;

export const ConnectionBadge = styled.div<{ status: "connecting" | "connected" | "closed" }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: ${({ theme }) => theme.colors.card};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${p =>
    p.status === 'connected' ? '#22c55e' :
      p.status === 'connecting' ? '#eab308' : '#ef4444'};
        box-shadow: 0 0 0 2px ${p =>
    p.status === 'connected' ? '#dcfce7' :
      p.status === 'connecting' ? '#fef9c3' : '#fee2e2'};
    }
`;

export const HealthBadge = styled.div<{ status: "ok" | "warning" | "critical" | "neutral" }>`
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    background: ${p =>
    p.status === "ok" ? "linear-gradient(135deg, #16a34a, #15803d)" :
      p.status === "warning" ? "linear-gradient(135deg, #ca8a04, #a16207)" :
        p.status === "critical" ? "linear-gradient(135deg, #dc2626, #b91c1c)" :
          "#94a3b8"};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

/* --- LAYOUT SECTIONS --- */

export const SectionTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 2.5rem 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr; /* Chart takes more space */
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
        grid-template-columns: 1fr;
    }
`;

/* --- METRICS --- */

export const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

export const MetricCard = styled.div`
    background: ${({ theme }) => theme.colors.card};
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
    }
`;

export const MetricLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
`;

export const MetricValue = styled.div`
    font-size: 2rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.1;
`;

export const MetricUnit = styled.div`
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-top: 0.5rem;
`;

/* --- CHARTS & LISTS --- */

export const ChartContainer = styled.div`
    background: ${({ theme }) => theme.colors.card};
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    min-height: 350px;
`;

export const SensorsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
`;

/* --- STATES --- */

export const Loader = styled.div`
    display: flex;
    justify-content: center;
    padding: 4rem;
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: 500;
`;

export const ErrorBox = styled.div`
    background: #fef2f2;
    color: #991b1b;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    border: 1px solid #fecaca;
    margin-bottom: 2rem;
    font-weight: 500;
`;

// Re-exporting Card related styles for SensorCard usage
export const Card = styled(MetricCard)`
    cursor: pointer;
    border-left: 4px solid transparent;
    &:hover {
        border-left-color: ${({ theme }) => theme.colors.accent.primary};
    }
`;

export const Status = styled.span<{ status: string }>`
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    background: ${p => p.status === 'ok' ? '#dcfce7' : p.status === 'critical' ? '#fee2e2' : '#fef9c3'};
    color: ${p => p.status === 'ok' ? '#166534' : p.status === 'critical' ? '#991b1b' : '#854d0e'};
`;

export const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  flex-wrap: wrap;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

export const TextInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus { 
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary}; 
    border-color: transparent; 
    background: ${({ theme }) => theme.colors.card};
  }
`;

export const SelectInput = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus { 
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary}; 
    border-color: transparent; 
  }
`;

export const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end; /* Alinear con los inputs */
  
  &:hover { background: ${({ theme }) => theme.colors.accent.hover}; }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

export const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

export const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const IngeniosList = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

export const ListHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ListItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* Espaciado para el botón "Primera" */
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const PageInfo = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

export const PaginationButton = styled.button`
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background};
  }
`;
