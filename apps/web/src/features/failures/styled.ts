import styled from "styled-components";

export const Container = styled.div`
	padding: 0;
`;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
`;

export const Title = styled.h1`
	font-size: 30px;
	font-weight: bold;
	color: #111827;
	margin: 0;
`;

export const Button = styled.button`
	padding: 10px 16px;
	background-color: #dc2626;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s, box-shadow 0.2s, transform 0.05s;
	box-shadow: 0 10px 15px -10px rgba(220, 38, 38, 0.7);

	&:hover {
		background-color: #b91c1c;
		box-shadow: 0 10px 20px -10px rgba(220, 38, 38, 0.9);
	}

	&:active {
		transform: scale(0.98);
	}
`;

// === FILTROS ===
export const FiltersBar = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 16px;

	> * {
		flex: 1 1 150px;
		min-width: 150px;
	}
`;

export const SelectInput = styled.select`
	width: 100%;
	min-height: 38px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;

	&:focus {
		outline: none;
		border-color: #dc2626;
		box-shadow: 0 0 0 1px #dc262633;
		background-color: white;
	}
`;

export const TextInput = styled.input`
	width: 100%;
	min-height: 38px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;

	&:focus {
		outline: none;
		border-color: #dc2626;
		box-shadow: 0 0 0 1px #dc262633;
		background-color: white;
	}
`;

// === LISTA Y TARJETAS ===
export const FailureList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const FailureCard = styled.div`
	background: white;
	border-radius: 12px;
	border: 1px solid #e5e7eb;
	padding: 20px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
`;

export const SensorName = styled.h3`
	font-size: 18px;
	font-weight: 600;
	margin: 0;
	color: #111827;
`;

export const EditButton = styled.button`
	padding: 6px 10px;
	font-size: 14px;
	background-color: #f3f4f6;
	border: none;
	border-radius: 999px;
	cursor: pointer;
	font-weight: 500;
	color: #374151;

	&:hover {
		background-color: #e5e7eb;
	}

	&:active {
		transform: scale(0.97);
	}
`;

export const TagRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 4px;
`;

export const Tag = styled.span`
	display: inline-flex;
	padding: 3px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 500;
	background-color: #f3f4f6;
	color: #374151;
`;

export const SeverityTag = styled(Tag)<{ $sev: string }>`
	background-color: ${({ $sev }) =>
		$sev === "Crítica"
			? "#fee2e2"
			: $sev === "Alta"
			? "#ffedd5"
			: $sev === "Media"
			? "#fef9c3"
			: "#dbeafe"};

	color: ${({ $sev }) =>
		$sev === "Crítica"
			? "#b91c1c"
			: $sev === "Alta"
			? "#b45309"
			: $sev === "Media"
			? "#92400e"
			: "#1e40af"};
`;

export const StatusTag = styled(Tag)<{ $sts: string }>`
	background-color: ${({ $sts }) =>
		$sts === "resuelta"
			? "#dcfce7"
			: $sts === "en reparación"
			? "#e0f2fe"
			: "#fee2e2"};

	color: ${({ $sts }) =>
		$sts === "resuelta"
			? "#15803d"
			: $sts === "en reparación"
			? "#0369a1"
			: "#b91c1c"};
`;

export const Description = styled.p`
	color: #374151;
	margin: 8px 0;
	font-size: 14px;
`;

export const InfoList = styled.div`
	font-size: 13px;
	color: #6b7280;
	display: flex;
	flex-direction: column;
	gap: 4px;

	p {
		margin: 0;
	}
`;

export const LoadingText = styled.div`
	text-align: center;
	padding: 48px 0;
	color: #6b7280;
`;

// === MODAL ===
export const Modal = styled.div`
	position: fixed;
	inset: 0;
	background-color: rgba(15, 23, 42, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	z-index: 50;
`;

export const ModalContent = styled.div`
	position: relative;
	background: white;
	border-radius: 12px;
	max-width: 520px;
	width: 100%;
	padding: 24px;
	max-height: 90vh;
	overflow-y: auto;
`;

export const CloseIconButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	height: 36px;
	width: 36px;
	border-radius: 999px;
	border: 1px solid #e5e7eb;
	background: #f9fafb;
	cursor: pointer;
	font-size: 18px;

	&:hover {
		background: #f3f4f6;
	}
`;

export const ModalTitle = styled.h2`
	font-size: 20px;
	font-weight: bold;
	margin: 0 0 16px 0;
	color: #111827;
`;

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const Field = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 14px;
`;

export const Label = styled.label`
	font-weight: 500;
	color: #374151;
`;

export const TextArea = styled.textarea`
	min-height: 70px;
	max-height: 180px;
	resize: vertical;
	width: 100%;
	padding: 8px 10px;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	background-color: #f9fafb;
`;

export const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	padding-top: 16px;
`;

export const CancelButton = styled.button`
	flex: 1;
	padding: 8px 16px;
	background: #f3f4f6;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	cursor: pointer;

	&:hover {
		background: #e5e7eb;
	}
`;

export const SubmitButton = styled.button`
	flex: 1;
	padding: 8px 16px;
	background-color: #dc2626;
	color: white;
	border: none;
	border-radius: 8px;

	&:hover {
		background-color: #b91c1c;
	}
`;