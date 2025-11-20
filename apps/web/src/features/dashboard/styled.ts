// src/pages/Dashboard/styled.ts
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
    padding: 2rem 3rem;
    background: #f8fafc; /* Slate-50 */
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    animation: ${fadeIn} 0.5s ease-out;
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
`;

export const Title = styled.h1`
    font-size: 2.25rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
    color: #64748b;
    margin-top: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
`;

// Header right side container
export const HeaderActions = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

export const ConnectionBadge = styled.div<{ status: "connecting" | "connected" | "closed" }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
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
    color: #334155;
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

    @media (max-width: 1024px) {
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
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
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
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
`;

export const MetricValue = styled.div`
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
`;

export const MetricUnit = styled.div`
    font-size: 0.875rem;
    font-weight: 500;
    color: #94a3b8;
    margin-top: 0.5rem;
`;

/* --- CHARTS & LISTS --- */

export const ChartContainer = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
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
    color: #64748b;
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
        border-left-color: #3b82f6;
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