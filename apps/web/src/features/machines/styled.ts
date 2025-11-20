// src/modules/machines/Machines.styles.ts
import styled from "styled-components";

/* =====================================
   CONTENEDOR GENERAL
===================================== */

export const Container = styled.div`
	padding: 24px;
	display: flex;
	flex-direction: column;
	gap: 20px;
	max-width: 1400px;
	margin: 0 auto;
`;

/* =====================================
   HEADER
===================================== */

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	flex-wrap: wrap;
	gap: 20px;
	padding-bottom: 16px;
	border-bottom: 1px solid #e5e7eb;
`;

export const HeaderRight = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

export const Title = styled.h1`
	margin: 0;
	font-size: 32px;
	font-weight: 800;
	color: #0f172a;
	letter-spacing: -0.5px;
`;

export const SubTitle = styled.p`
	margin: 8px 0 0 0;
	font-size: 14px;
	color: #475569;
	max-width: 520px;
	line-height: 1.5;
	font-weight: 400;
`;

/* =====================================
   RESUMEN LISTADO
===================================== */

export const ListSummary = styled.div`
	margin-top: 12px;
	font-size: 13px;
	color: #475569;
	display: flex;
	flex-wrap: wrap;
	gap: 10px;

	span {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 6px 12px;
		font-weight: 500;
		color: #334155;
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
	}
`;

/* =====================================
   BOTÓN PRINCIPAL
===================================== */

export const Button = styled.button`
	padding: 10px 18px;
	background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
	color: #ffffff;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 600;
	font-size: 14px;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;

	&::before {
		content: "＋";
		font-size: 16px;
		font-weight: 700;
	}

	&:hover {
		background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
		box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
		transform: translateY(-2px);
	}

	&:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}
`;

/* =====================================
   LISTA Y TARJETAS DE MÁQUINAS
===================================== */

export const MachineList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 8px;
`;

export const MachineCard = styled.div`
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 10px;
	border: 1px solid #e5e7eb;
	padding: 16px 18px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
		border-color: #cbd5e1;
		transform: translateY(-2px);
	}

	&:active {
		transform: translateY(0);
	}
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
`;

export const MachineMain = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
`;

export const MachineName = styled.h3`
	margin: 0;
	font-size: 17px;
	font-weight: 700;
	color: #0f172a;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	letter-spacing: -0.3px;
`;

export const SmallText = styled.p`
	margin: 0;
	font-size: 13px;
	color: #64748b;
	font-weight: 400;
`;

/* Línea secundaria tipo "chips de texto" */
export const SecondaryLine = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	font-size: 12px;
	color: #475569;

	span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	span::before {
		content: "•";
		color: #cbd5e1;
		font-weight: bold;
	}

	span:first-child::before {
		content: "";
	}
`;

/* =====================================
   FILA DE ACCIONES
===================================== */

export const ActionsRow = styled.div`
	display: flex;
	gap: 8px;
`;

export const IconButton = styled.button`
	padding: 7px 12px;
	font-size: 12px;
	background-color: #eff6ff;
	border: 1px solid #bfdbfe;
	border-radius: 7px;
	cursor: pointer;
	font-weight: 500;
	color: #1d4ed8;
	transition: all 0.15s ease;

	&:hover {
		background-color: #dbeafe;
		border-color: #7dd3fc;
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
		box-shadow: none;
	}
`;

export const DangerousButton = styled(IconButton)`
	background-color: #fef2f2;
	border-color: #fecaca;
	color: #b91c1c;

	&:hover {
		background-color: #fee2e2;
		border-color: #fca5a5;
		box-shadow: 0 2px 6px rgba(185, 28, 28, 0.15);
	}
`;

/* =====================================
   INFO LIST / DETALLES
===================================== */

export const InfoList = styled.div`
	font-size: 13px;
	color: #475569;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 10px 18px;
	margin-top: 8px;
	padding-top: 10px;
	border-top: 1px solid #f1f5f9;

	p {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		line-height: 1.4;

		strong {
			color: #1e293b;
			font-weight: 600;
		}
	}
`;

/* Pequeño pill informativo inline */
export const InlineInfoPill = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 6px;

	font-size: 12px;
	font-weight: 500;
	color: #1e293b;

	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 7px;
	border: 1px solid #e2e8f0;
	padding: 6px 11px;
	white-space: nowrap;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

	strong {
		color: #0f172a;
		font-weight: 600;
	}
`;

/* =====================================
   TAGS
===================================== */

export const TagRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 8px;
`;

export const Tag = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 500;
	background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	color: #374151;
	border: 1px solid #d1d5db;
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

/* =====================================
   ESTADOS (LOADING / ERROR / EMPTY)
===================================== */

export const LoadingText = styled.div`
	text-align: center;
	padding: 48px 0;
	color: #64748b;
	font-size: 15px;
	font-weight: 500;
`;

export const ErrorBox = styled.div`
	padding: 14px 16px;
	background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
	color: #991b1b;
	border-radius: 10px;
	font-size: 14px;
	border: 1px solid #fecaca;
	font-weight: 500;
`;

export const EmptyState = styled.div`
	padding: 48px 0;
	text-align: center;
	color: #64748b;
	display: flex;
	flex-direction: column;
	gap: 16px;
	align-items: center;
	font-size: 15px;

	button {
		border: 1px solid #d1d5db;
		background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
		border-radius: 8px;
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		color: #374151;
		transition: all 0.15s ease;

		&:hover {
			background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
			border-color: #cbd5e1;
			box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
		}
	}
`;

/* =====================================
   HEADER DE LISTA
===================================== */

export const ListHeaderRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	font-size: 12px;
	color: #64748b;
	padding: 6px 0;
	font-weight: 500;
`;

/* =====================================
   FILTROS
===================================== */

export const FiltersBar = styled.div`
	display: grid;
	grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1.4fr) minmax(
			0,
			1.5fr
		) auto;
	gap: 10px;
	align-items: center;
	padding: 12px 14px;
	border-radius: 10px;
	background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
	border: 1px solid #e5e7eb;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

	@media (max-width: 900px) {
		grid-template-columns: 1fr 1fr;
	}

	@media (max-width: 600px) {
		grid-template-columns: 1fr;
	}
`;

export const FiltersRight = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
`;

export const CheckboxLabel = styled.label`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	color: #475569;
	white-space: nowrap;
	cursor: pointer;
	font-weight: 500;

	input {
		width: 16px;
		height: 16px;
		cursor: pointer;
		accent-color: #2563eb;
	}
`;

export const ResetFiltersButton = styled.button`
	border-radius: 7px;
	padding: 7px 12px;
	font-size: 12px;
	background: #f3f4f6;
	border: 1px solid #d1d5db;
	cursor: pointer;
	color: #374151;
	font-weight: 500;
	transition: all 0.15s ease;

	&:hover {
		background-color: #e5e7eb;
		border-color: #cbd5e1;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
	}

	&:active {
		transform: scale(0.98);
	}
`;

export const SortDirButton = styled.button`
	border-radius: 7px;
	padding: 7px 12px;
	font-size: 12px;
	border: 1px solid #93c5fd;
	background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
	color: #1d4ed8;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	font-weight: 500;
	transition: all 0.15s ease;

	&:hover {
		background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
		border-color: #60a5fa;
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.12);
	}

	&:active {
		transform: scale(0.98);
	}
`;

/* =====================================
   CAMPOS DE FORMULARIO
===================================== */

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 18px;
`;

export const Field = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 14px;
`;

export const Label = styled.label`
	font-weight: 600;
	color: #1f2937;
	font-size: 14px;
`;

export const TextInput = styled.input`
	width: 100%;
	min-height: 40px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 9px 12px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	transition: all 0.15s ease;
	font-family: inherit;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
		background-color: #ffffff;
	}

	&:disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}
`;

export const NumberInput = styled(TextInput).attrs({ type: "number" })`
	text-align: right;
`;

export const SelectInput = styled.select`
	width: 100%;
	min-height: 40px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 9px 12px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	transition: all 0.15s ease;
	font-family: inherit;
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
		background-color: #ffffff;
	}

	&:disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}
`;

export const TextArea = styled.textarea`
	width: 100%;
	min-height: 80px;
	max-height: 200px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 9px 12px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	resize: vertical;
	overflow-y: auto;
	transition: all 0.15s ease;
	font-family: inherit;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
		background-color: #ffffff;
	}

	&:disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}
`;

export const ErrorText = styled.span`
	font-size: 13px;
	color: #b91c1c;
	font-weight: 500;
`;

/* =====================================
   MODAL
===================================== */

export const Modal = styled.div`
	position: fixed;
	inset: 0;
	background-color: rgba(15, 23, 42, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	z-index: 50;
	backdrop-filter: blur(4px);
	animation: fadeIn 0.2s ease;

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
`;

export const ModalContent = styled.div`
	position: relative;
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 12px;
	max-width: 580px;
	width: 100%;
	padding: 26px;
	box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
	max-height: 90vh;
	overflow-y: auto;
	border: 1px solid #e5e7eb;
	animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

export const CloseIconButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	height: 36px;
	width: 36px;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	background: #f9fafb;
	color: #64748b;
	cursor: pointer;
	font-size: 20px;
	line-height: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s ease;

	&:hover {
		background: #f3f4f6;
		border-color: #cbd5e1;
		color: #334155;
	}

	&:active {
		transform: scale(0.95);
	}
`;

export const ModalTitle = styled.h2`
	font-size: 20px;
	font-weight: 700;
	margin: 0 0 18px 0;
	color: #0f172a;
	letter-spacing: -0.3px;
`;

/* Botones de formulario del modal */

export const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	padding-top: 20px;
	border-top: 1px solid #e5e7eb;
	margin-top: 20px;
`;

export const BaseButton = styled.button`
	flex: 1;
	min-height: 42px;
	padding: 10px 16px;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	transition: all 0.15s ease;
	border: none;

	&:active {
		transform: scale(0.98);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export const CancelButton = styled(BaseButton)`
	background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
	color: #374151;
	border: 1px solid #d1d5db;

	&:hover {
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		border-color: #cbd5e1;
		box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
	}
`;

export const SubmitButton = styled(BaseButton)`
	background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
	color: #ffffff;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);

	&:hover {
		background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
		box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
		transform: translateY(-1px);
	}
`;