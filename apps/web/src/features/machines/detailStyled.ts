import styled from "styled-components";

/* -----------------------------------------
   CONTENEDOR GENERAL
----------------------------------------- */

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 24px;
	max-width: 1400px;
	margin: 0 auto;
`;

/* -----------------------------------------
   HEADER
----------------------------------------- */

export const Header = styled.header`
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 32px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const Title = styled.h1`
	margin: 0;
	font-size: 36px;
	font-weight: 800;
	color: #0f172a;
	letter-spacing: -0.7px;
	line-height: 1.2;
`;

export const SubInfo = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	font-size: 14px;
	color: #64748b;
	font-weight: 500;

	span {
		display: flex;
		align-items: center;
		gap: 4px;
	}
`;

/* -----------------------------------------
   TAGS
----------------------------------------- */

export const TagRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 4px;
`;

export const Tag = styled.span`
	padding: 6px 13px;
	background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
	color: #475569;
	border-radius: 7px;
	font-size: 12px;
	font-weight: 600;
	border: 1px solid #cbd5e1;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
`;

export const StatusTag = styled(Tag)<{ $active: boolean }>`
	background: ${({ $active }) =>
		$active
			? "linear-gradient(135deg, #dcfce7 0%, #c6f6d5 100%)"
			: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"};
	color: ${({ $active }) => ($active ? "#15803d" : "#b91c1c")};
	border: 1px solid
		${({ $active }) => ($active ? "#86efac" : "#fca5a5")};
`;

/* -----------------------------------------
   TABS
----------------------------------------- */

export const TabsRow = styled.div`
	display: flex;
	gap: 32px;
	padding-top: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid #e5e7eb;
	margin-top: 8px;
	overflow-x: auto;

	&::-webkit-scrollbar {
		height: 4px;
	}

	&::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 999px;
	}

	&::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 999px;
	}
`;

export const TabButton = styled.button<{ $active: boolean }>`
	background: none;
	border: none;
	cursor: pointer;
	padding: 10px 4px;
	font-size: 15px;
	font-weight: ${({ $active }) => ($active ? 700 : 500)};
	color: ${({ $active }) => ($active ? "#1e3a8a" : "#64748b")};
	border-bottom: 3px solid
		${({ $active }) => ($active ? "#2563eb" : "transparent")};
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;
	position: relative;

	&:hover {
		color: ${({ $active }) => ($active ? "#1e3a8a" : "#334155")};
	}

	&:active {
		transform: scale(0.98);
	}
`;

/* -----------------------------------------
   SECCIONES
----------------------------------------- */

export const Section = styled.section`
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 32px;
	box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
	animation: fadeIn 0.3s ease;

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

export const SectionTitle = styled.h2`
	margin: 0 0 24px 0;
	font-size: 24px;
	font-weight: 800;
	color: #0f172a;
	letter-spacing: -0.4px;
`;

/* -----------------------------------------
   LISTA SIMPLE
----------------------------------------- */

export const List = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;

	p {
		margin: 0;
		font-size: 15px;
		color: #475569;
		line-height: 1.6;

		strong {
			font-weight: 700;
			color: #0f172a;
			display: inline-block;
			min-width: 120px;
		}
	}
`;

/* -----------------------------------------
   LISTA DE TARJETAS
----------------------------------------- */

export const CardList = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
`;

export const InfoCard = styled.div<{ $error?: boolean }>`
	background: ${({ $error }) =>
		$error
			? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
			: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)"};
	border: 1px solid ${({ $error }) => ($error ? "#fecaca" : "#e5e7eb")};
	border-radius: 10px;
	padding: 18px 20px;
	box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
	display: flex;
	flex-direction: column;
	gap: 8px;
	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
		${({ $error }) =>
			$error
				? "border-color: #fca5a5;"
				: "border-color: #cbd5e1;"}
		transform: translateY(-2px);
	}

	.title {
		font-weight: 700;
		font-size: 15px;
		color: #0f172a;
		margin: 0 0 6px 0;
		line-height: 1.4;
	}

	p {
		margin: 0;
		font-size: 13px;
		color: #64748b;
		line-height: 1.5;

		strong {
			font-weight: 600;
			color: #334155;
		}
	}

	.notes {
		color: #64748b;
		font-size: 13px;
		margin-top: 6px;
		padding-top: 8px;
		border-top: 1px solid
			${({ $error }) => ($error ? "#fee2e2" : "#e5e7eb")};
		font-style: italic;
	}

	.resolved {
		color: #15803d;
		font-weight: 600;
		background: rgba(34, 197, 94, 0.08);
		padding: 4px 8px;
		border-radius: 4px;
		display: inline-block;
		width: fit-content;
	}
`;

/* -----------------------------------------
   EMPTY STATE
----------------------------------------- */

export const EmptyMessage = styled.div`
	padding: 52px 0;
	text-align: center;
	font-size: 15px;
	color: #94a3b8;
	font-weight: 500;
`;