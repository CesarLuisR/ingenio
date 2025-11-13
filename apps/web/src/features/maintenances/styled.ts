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
	background-color: #2563eb;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s, box-shadow 0.2s, transform 0.05s;
	box-shadow: 0 10px 15px -10px rgba(37, 99, 235, 0.7);

	&:hover {
		background-color: #1d4ed8;
		box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.9);
	}

	&:active {
		transform: scale(0.98);
		box-shadow: 0 4px 10px -6px rgba(37, 99, 235, 0.9);
	}
`;

export const ImportButton = styled(Button)`
	background-color: #059669;
	box-shadow: 0 10px 15px -10px rgba(5, 150, 105, 0.7);

	&:hover {
		background-color: #047857;
		box-shadow: 0 10px 20px -10px rgba(5, 150, 105, 0.9);
	}
`;

export const MaintenanceList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const MaintenanceCard = styled.div`
	background: white;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	padding: 20px;
	border: 1px solid #e5e7eb;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 4px;
`;

export const SensorName = styled.h3`
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	margin: 0;
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
	transition: background-color 0.2s, transform 0.05s;

	&:hover {
		background-color: #e5e7eb;
	}

	&:active {
		transform: scale(0.97);
	}
`;

export const Description = styled.p`
	color: #374151;
	margin: 4px 0;
	font-size: 14px;
`;

export const InfoList = styled.div`
	font-size: 13px;
	color: #6b7280;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 4px 16px;

	p {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 4px;
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
	align-items: center;
	justify-content: center;
	padding: 3px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 500;
	background-color: #f3f4f6;
	color: #374151;
`;

export const TypeTag = styled(Tag)<{ $type: string }>`
	background-color: ${({ $type }) =>
		$type === "Correctivo"
			? "#fee2e2"
			: $type === "Predictivo"
			? "#e0f2fe"
			: "#dcfce7"};
	color: ${({ $type }) =>
		$type === "Correctivo"
			? "#b91c1c"
			: $type === "Predictivo"
			? "#0369a1"
			: "#15803d"};
`;

export const FailureTag = styled(Tag)<{ $status?: string | null }>`
	background-color: ${({ $status }) =>
		$status === "resuelta"
			? "#dcfce7"
			: $status === "en reparación"
			? "#fef9c3"
			: "#fee2e2"};
	color: ${({ $status }) =>
		$status === "resuelta"
			? "#15803d"
			: $status === "en reparación"
			? "#92400e"
			: "#b91c1c"};
`;

export const LoadingText = styled.div`
	text-align: center;
	padding: 48px 0;
	color: #6b7280;
`;

// === Modal base ===
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
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
	color: #111827;
	cursor: pointer;
	font-size: 18px;
	line-height: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.15s, border-color 0.15s, transform 0.05s;

	&:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	&:active {
		transform: scale(0.96);
	}
`;

export const ModalTitle = styled.h2`
	font-size: 20px;
	font-weight: bold;
	margin: 0 0 16px 0;
	color: #111827;
`;

// === Botones form ===
export const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	padding-top: 16px;
`;

export const BaseButton = styled.button`
	flex: 1;
	min-height: 40px;
	padding: 8px 16px;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.15s, border-color 0.15s, color 0.15s,
		transform 0.05s;
	display: inline-flex;
	align-items: center;
	justify-content: center;

	&:active {
		transform: scale(0.97);
	}
`;

export const CancelButton = styled(BaseButton)`
	background: #f3f4f6;
	color: #111827;
	border: 1px solid #d1d5db;
	&:hover {
		background: #e5e7eb;
		border-color: #cfd4dc;
	}
`;

export const SubmitButton = styled(BaseButton)`
	background-color: #2563eb;
	color: white;
	border: none;
	&:hover {
		background-color: #1d4ed8;
	}
`;

// === Campos de formulario ===
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

export const TextInput = styled.input`
	width: 100%;
	min-height: 38px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb33;
		background-color: white;
	}
`;

export const NumberInput = styled(TextInput).attrs({ type: "number" })`
	text-align: right;
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
	transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb33;
		background-color: white;
	}
`;

export const TextArea = styled.textarea`
	width: 100%;
	min-height: 70px;
	max-height: 180px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	resize: vertical;
	overflow-y: auto;
	transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb33;
		background-color: white;
	}
`;

export const ErrorText = styled.span`
	font-size: 12px;
	color: #b91c1c;
`;

// === Filtros ===
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