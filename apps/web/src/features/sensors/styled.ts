import styled from "styled-components";

/* --- GENERAL LAYOUT --- */
export const Container = styled.div`
	padding: 2rem 1.5rem;
	max-width: 1200px;
	margin: 0 auto;
`;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
	flex-wrap: wrap;
	gap: 1rem;
`;

export const Title = styled.h1`
	font-size: 2rem;
	font-weight: 700;
	color: #0f172a;
	margin: 0;
`;

export const Button = styled.button`
	padding: 0.6rem 1.25rem;
	background-color: #2563eb;
	color: white;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;
	font-weight: 500;
	box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
	transition: all 0.2s ease;

	&:hover {
		background-color: #1d4ed8;
		transform: translateY(-1px);
	}
`;

export const SearchInput = styled.input`
	width: 100%;
	padding: 0.75rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	margin-bottom: 1.5rem;
	font-size: 1rem;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}
`;

/* --- GRID & CARDS --- */
export const Grid = styled.div`
	display: grid;
	gap: 1.5rem;
	grid-template-columns: 1fr;

	@media (min-width: 768px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (min-width: 1024px) {
		grid-template-columns: repeat(3, 1fr);
	}
`;

export const Card = styled.div`
	background-color: white;
	border-radius: 0.75rem;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
	padding: 1.5rem;
	border: 1px solid #e5e7eb;
	transition: transform 0.2s;

	&:hover {
		transform: translateY(-2px);
	}
`;

export const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.75rem;
`;

export const CardTitle = styled.h3`
	font-weight: 600;
	font-size: 1.125rem;
	color: #111827;
	margin: 0;
`;

export const CardSubtitle = styled.p`
	font-size: 0.875rem;
	color: #6b7280;
	margin: 0;
`;

export const Badge = styled.span<{ $status: string }>`
	padding: 0.35rem 0.6rem;
	border-radius: 0.4rem;
	font-size: 0.75rem;
	font-weight: 500;
	background-color: ${(p) =>
		p.$status === "active"
			? "#d1fae5"
			: p.$status === "maintenance"
			? "#fef3c7"
			: "#f3f4f6"};
	color: ${(p) =>
		p.$status === "active"
			? "#065f46"
			: p.$status === "maintenance"
			? "#92400e"
			: "#374151"};
`;

export const Location = styled.p`
	font-size: 0.875rem;
	color: #4b5563;
	margin-bottom: 1rem;
`;

export const ButtonGroup = styled.div`
	display: flex;
	gap: 0.75rem;
	margin-top: 0.5rem;
`;

export const SecondaryButton = styled(Button)`
	background-color: #f3f4f6;
	color: #374151;
	box-shadow: none;

	&:hover {
		background-color: #e5e7eb;
	}
`;

export const DangerButton = styled(Button)`
	background-color: #fee2e2;
	color: #b91c1c;
	box-shadow: none;

	&:hover {
		background-color: #fecaca;
	}
`;

export const Loading = styled.div`
	text-align: center;
	padding: 3rem;
	color: #6b7280;
	font-size: 1rem;
`;

/* --- MODAL --- */
export const Modal = styled.div`
	position: fixed;
	inset: 0;
	background-color: rgba(15, 23, 42, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.5rem;
	z-index: 100;
	backdrop-filter: blur(3px);
`;

export const ModalContent = styled.div`
	background-color: #ffffff;
	border-radius: 0.75rem;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
	max-width: 600px;
	width: 100%;
	padding: 2rem;
	max-height: 90vh;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
`;

export const ModalTitle = styled.h2`
	font-size: 1.5rem;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 1.25rem;
	border-bottom: 2px solid #e5e7eb;
	padding-bottom: 0.5rem;
`;

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
`;

export const FormGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
`;

export const Label = styled.label`
	font-size: 0.9rem;
	font-weight: 500;
	color: #374151;
`;

export const Input = styled.input`
	width: 100%;
	padding: 0.6rem 0.8rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	font-size: 1rem;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}
`;

export const Select = styled.select`
	width: 100%;
	padding: 0.6rem 0.8rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	font-size: 1rem;
	background-color: #fff;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}
`;

export const ModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	margin-top: 1.5rem;
`;

export const CancelButton = styled(Button)`
	background-color: #f9fafb;
	color: #374151;
	border: 1px solid #d1d5db;

	&:hover {
		background-color: #f3f4f6;
	}
`;

export const SubmitButton = styled(Button)`
	background-color: #2563eb;
	color: white;

	&:hover {
		background-color: #1d4ed8;
	}
`;

/* --- METRICS CONFIG EDITOR --- */
export const EditorContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	padding: 1.25rem;
	background: #f9fafb;
	border-radius: 0.75rem;
	border: 1px solid #e5e7eb;
`;

export const EditorHeader = styled.h3`
	margin: 0;
	color: #1f2937;
	font-weight: 600;
	border-bottom: 1px solid #e5e7eb;
	padding-bottom: 0.5rem;
`;

export const GroupCard = styled.div`
	background: white;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
`;

export const GroupHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const GroupTitle = styled.h4`
	margin: 0;
	color: #111827;
	font-weight: 600;
`;

export const MetricRow = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.5rem 0;
	border-bottom: 1px dashed #e5e7eb;
	flex-wrap: wrap;

	&:last-child {
		border-bottom: none;
	}
`;

export const MetricsLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 0.25rem;
	color: #374151;
	font-size: 0.9rem;
`;

export const InputField = styled.input`
	width: 80px;
	padding: 0.3rem 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	outline: none;
	font-size: 0.9rem;

	&:focus {
		border-color: #2563eb;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
	}
`;

export const MetricsButton = styled(Button)`
	align-self: flex-start;
	background-color: #2563eb;

	&:hover {
		background-color: #1d4ed8;
	}
`;

export const AddButton = styled(Button)`
	background-color: #10b981;

	&:hover {
		background-color: #059669;
	}
`;

export const DeleteButton = styled.button`
	background: transparent;
	border: none;
	cursor: pointer;
	font-size: 1.1rem;
	color: #ef4444;
	padding: 0.2rem 0.4rem;
	transition: transform 0.1s ease, color 0.2s;

	&:hover {
		transform: scale(1.1);
		color: #dc2626;
	}
`;
