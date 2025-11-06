import styled, { keyframes } from "styled-components";

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Page = styled.div`
	padding: 2rem;
	background-color: #f3f4f6;
	min-height: 100vh;
	animation: ${fadeIn} 0.4s ease;
`;

export const Title = styled.h1`
	font-size: 1.875rem;
	font-weight: bold;
	color: #111827;
	margin-bottom: 1.5rem;
`;

export const Sub = styled.p`
	color: #6b7280;
	margin-top: -1rem;
	margin-bottom: 2rem;
`;

export const Card = styled.div`
	background-color: white;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	margin-bottom: 2rem;
	transition: transform 0.2s ease, box-shadow 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
`;

export const ChartHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;

	h2 {
		font-size: 1.25rem;
		color: #1e40af;
	}
`;

export const MetricStatus = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 1rem;
`;

export const Status = styled.span<{ status: string }>`
	display: inline-block;
	padding: 4px 10px;
	border-radius: 6px;
	font-weight: 500;
	color: ${(p) =>
		p.status === "ok"
			? "#065f46"
			: p.status === "warning"
			? "#92400e"
			: p.status === "critical"
			? "#991b1b"
			: "#374151"};
	background-color: ${(p) =>
		p.status === "ok"
			? "#d1fae5"
			: p.status === "warning"
			? "#fef3c7"
			: p.status === "critical"
			? "#fee2e2"
			: "#e5e7eb"};
`;

export const InfoSection = styled.div`
	background-color: white;
	border-radius: 8px;
	padding: 1.25rem;
	margin-bottom: 1.5rem;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

	h2 {
		color: #1e3a8a;
		font-size: 1.125rem;
		margin-bottom: 0.75rem;
	}
`;

export const CodeBox = styled.pre`
	background: #f8fafc;
	padding: 1rem;
	border-radius: 8px;
	font-size: 0.9rem;
	overflow-x: auto;
	color: #334155;
`;