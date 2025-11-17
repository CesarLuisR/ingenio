// src/pages/Dashboard/styled.ts
import styled from "styled-components";

export const Container = styled.div`
	padding: 2rem 3rem;
	background: #f3f4f6;
	min-height: 100vh;
`;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
`;

export const Title = styled.h1`
	font-size: 2rem;
	font-weight: 700;
	color: #111827;
`;

export const Subtitle = styled.p`
	color: #6b7280;
	margin-top: 0.25rem;
`;

export const HealthBadge = styled.div<{ status: "ok" | "warning" | "critical" | "neutral" }>`
	padding: 8px 14px;
	border-radius: 12px;
	font-weight: 600;
	color: white;
	${(p) =>
		p.status === "ok"
			? `background-color: #16a34a;`
			: p.status === "warning"
			? `background-color: #ca8a04;`
			: p.status === "critical"
			? `background-color: #dc2626;`
			: `background-color: #6b7280;`}
`;

export const MetricsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
	gap: 1.5rem;
`;

export const MetricCard = styled.div`
	background: white;
	padding: 1.25rem;
	border-radius: 16px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
`;

export const MetricLabel = styled.div`
	font-size: 0.85rem;
	font-weight: 600;
	color: #6b7280;
	text-transform: uppercase;
	letter-spacing: 0.05em;
`;

export const MetricValue = styled.div`
	font-size: 2rem;
	font-weight: 700;
	color: #111827;
	margin-top: 0.25rem;
`;

export const MetricUnit = styled.div`
	font-size: 0.8rem;
	color: #9ca3af;
	margin-top: 0.15rem;
`;

export const Loader = styled.div`
	margin-top: 2rem;
	font-size: 1rem;
	color: #4b5563;
`;

export const ErrorBox = styled.div`
	margin-top: 2rem;
	background: #fee2e2;
	color: #b91c1c;
	padding: 1.25rem;
	border-radius: 12px;
	border: 1px solid #fecaca;
	font-weight: 500;
`;
