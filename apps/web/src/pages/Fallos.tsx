import type React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { type Failure, type Sensor } from "../types";
import { api } from "../lib/api";

// === UTILIDADES ===
const normalize = (s: string) =>
	s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

// === ESTILOS BASE ===
const Container = styled.div`
	padding: 0;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
`;

const Title = styled.h1`
	font-size: 30px;
	font-weight: bold;
	color: #111827;
	margin: 0;
`;

const Button = styled.button`
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
const FiltersBar = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 16px;

	> * {
		flex: 1 1 150px;
		min-width: 150px;
	}
`;

const SelectInput = styled.select`
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

const TextInput = styled.input`
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
const FailureList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const FailureCard = styled.div`
	background: white;
	border-radius: 12px;
	border: 1px solid #e5e7eb;
	padding: 20px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
`;

const SensorName = styled.h3`
	font-size: 18px;
	font-weight: 600;
	margin: 0;
	color: #111827;
`;

const EditButton = styled.button`
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

const TagRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 4px;
`;

const Tag = styled.span`
	display: inline-flex;
	padding: 3px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 500;
	background-color: #f3f4f6;
	color: #374151;
`;

const SeverityTag = styled(Tag)<{ $sev: string }>`
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

const StatusTag = styled(Tag)<{ $sts: string }>`
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

const Description = styled.p`
	color: #374151;
	margin: 8px 0;
	font-size: 14px;
`;

const InfoList = styled.div`
	font-size: 13px;
	color: #6b7280;
	display: flex;
	flex-direction: column;
	gap: 4px;

	p {
		margin: 0;
	}
`;

const LoadingText = styled.div`
	text-align: center;
	padding: 48px 0;
	color: #6b7280;
`;

// === MODAL ===
const Modal = styled.div`
	position: fixed;
	inset: 0;
	background-color: rgba(15, 23, 42, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	z-index: 50;
`;

const ModalContent = styled.div`
	position: relative;
	background: white;
	border-radius: 12px;
	max-width: 520px;
	width: 100%;
	padding: 24px;
	max-height: 90vh;
	overflow-y: auto;
`;

const CloseIconButton = styled.button`
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

const ModalTitle = styled.h2`
	font-size: 20px;
	font-weight: bold;
	margin: 0 0 16px 0;
	color: #111827;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const Field = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 14px;
`;

const Label = styled.label`
	font-weight: 500;
	color: #374151;
`;

const TextArea = styled.textarea`
	min-height: 70px;
	max-height: 180px;
	resize: vertical;
	width: 100%;
	padding: 8px 10px;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	background-color: #f9fafb;
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	padding-top: 16px;
`;

const CancelButton = styled.button`
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

const SubmitButton = styled.button`
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

// =======================================================
// === COMPONENTE PRINCIPAL: FALLAS =======================
// =======================================================

export default function Fallos() {
	const [failures, setFailures] = useState<Failure[]>([]);
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [loading, setLoading] = useState(true);

	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Failure | null>(null);

	// filtros
	const [filterSensorId, setFilterSensorId] = useState("");
	const [filterSeverity, setFilterSeverity] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [filterText, setFilterText] = useState("");

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [failuresData, sensorsData] = await Promise.all([
				api.getFailures(),
				api.getSensors(),
			]);
			setFailures(failuresData);
			setSensors(sensorsData);
		} catch (err) {
			console.error("Error cargando datos:", err);
		} finally {
			setLoading(false);
		}
	};

	const filtered = failures.filter((f) => {
		if (filterSensorId && f.sensorId.toString() !== filterSensorId)
			return false;
		if (filterSeverity && (f.severity || "") !== filterSeverity)
			return false;
		if (filterStatus && (f.status || "") !== filterStatus) return false;

		if (filterText) {
			const t = normalize(filterText);
			const haystack =
				normalize(f.description || "") +
				" " +
				normalize(sensors.find((s) => s.id === f.sensorId)?.name || "");

			if (!haystack.includes(t)) return false;
		}

		return true;
	});

	if (loading) return <LoadingText>Cargando fallas...</LoadingText>;

	return (
		<Container>
			<Header>
				<Title>Registro de Fallas</Title>
				<Button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}>
					+ Reportar Falla
				</Button>
			</Header>

			{/* FILTROS */}
			<FiltersBar>
				<SelectInput
					value={filterSensorId}
					onChange={(e) => setFilterSensorId(e.target.value)}>
					<option value="">Todos los sensores</option>
					{sensors.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</SelectInput>

				<SelectInput
					value={filterSeverity}
					onChange={(e) => setFilterSeverity(e.target.value)}>
					<option value="">Todas las severidades</option>
					<option value="Baja">Baja</option>
					<option value="Media">Media</option>
					<option value="Alta">Alta</option>
					<option value="Crítica">Crítica</option>
				</SelectInput>

				<SelectInput
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}>
					<option value="">Todos los estados</option>
					<option value="pendiente">Pendiente</option>
					<option value="en reparación">En reparación</option>
					<option value="resuelta">Resuelta</option>
				</SelectInput>

				<TextInput
					placeholder="Buscar texto..."
					value={filterText}
					onChange={(e) => setFilterText(e.target.value)}
				/>
			</FiltersBar>

			{/* LISTA */}
			<FailureList>
				{filtered.map((f) => {
					const sensor = sensors.find((s) => s.id === f.sensorId);

					return (
						<FailureCard key={f.id}>
							<CardHeader>
								<SensorName>
									{sensor?.name || `Sensor ${f.sensorId}`}
								</SensorName>

								<EditButton
									onClick={() => {
										setEditing(f);
										setShowForm(true);
									}}>
									Editar
								</EditButton>
							</CardHeader>

							<TagRow>
								<SeverityTag $sev={f.severity || "Media"}>
									Severidad: {f.severity || "Media"}
								</SeverityTag>

								<StatusTag $sts={f.status || "pendiente"}>
									{f.status || "pendiente"}
								</StatusTag>
							</TagRow>

							<Description>{f.description}</Description>

							<InfoList>
								<p>
									🕒 Detectado:{" "}
									{new Date(f.occurredAt).toLocaleString()}
								</p>
								{f.resolvedAt && (
									<p>
										✅ Resuelto:{" "}
										{new Date(
											f.resolvedAt
										).toLocaleString()}
									</p>
								)}
							</InfoList>
						</FailureCard>
					);
				})}
			</FailureList>

			{showForm && (
				<FailureForm
					sensors={sensors}
					initialData={editing}
					onClose={() => {
						setShowForm(false);
						setEditing(null);
					}}
					onSave={() => {
						loadData();
						setShowForm(false);
						setEditing(null);
					}}
				/>
			)}
		</Container>
	);
}

// =======================================================
// === FORMULARIO DE FALLAS ===============================
// =======================================================

function FailureForm({
	sensors,
	initialData,
	onClose,
	onSave,
}: {
	sensors: Sensor[];
	initialData?: Failure | null;
	onClose: () => void;
	onSave: () => void;
}) {
	const [formData, setFormData] = useState({
		sensorId: initialData?.sensorId?.toString() || "",
		description: initialData?.description || "",
		severity: initialData?.severity || "Media",
		status: initialData?.status || "pendiente",
		resolvedAt: initialData?.resolvedAt || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload = {
			sensorId: Number(formData.sensorId),
			description: formData.description,
			severity: formData.severity,
			status: formData.status,
			occurredAt: initialData
				? initialData.occurredAt
				: new Date().toISOString(),
			resolvedAt:
				formData.status === "resuelta"
					? new Date().toISOString()
					: null,
		};

		try {
			if (initialData) {
				await api.updateFailure(initialData.id.toString(), payload);
			} else {
				await api.createFailure(payload);
			}
			onSave();
		} catch (err) {
			console.error("Error guardando falla:", err);
		}
	};

	return (
		<Modal onClick={onClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<CloseIconButton onClick={onClose}>×</CloseIconButton>

				<ModalTitle>
					{initialData ? "Editar Falla" : "Reportar Falla"}
				</ModalTitle>

				<Form onSubmit={handleSubmit}>
					<Field>
						<Label>Sensor</Label>
						<SelectInput
							required
							value={formData.sensorId}
							onChange={(e) =>
								setFormData({
									...formData,
									sensorId: e.target.value,
								})
							}>
							<option value="">Seleccionar sensor</option>
							{sensors.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</SelectInput>
					</Field>

					<Field>
						<Label>Descripción</Label>
						<TextArea
							required
							rows={3}
							value={formData.description}
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
						/>
					</Field>

					<Field>
						<Label>Severidad</Label>
						<SelectInput
							value={formData.severity}
							onChange={(e) =>
								setFormData({
									...formData,
									severity: e.target.value,
								})
							}>
							<option value="Baja">Baja</option>
							<option value="Media">Media</option>
							<option value="Alta">Alta</option>
							<option value="Crítica">Crítica</option>
						</SelectInput>
					</Field>

					<Field>
						<Label>Estado</Label>
						<SelectInput
							value={formData.status}
							onChange={(e) =>
								setFormData({
									...formData,
									status: e.target.value,
								})
							}>
							<option value="pendiente">Pendiente</option>
							<option value="en reparación">En reparación</option>
							<option value="resuelta">Resuelta</option>
						</SelectInput>
					</Field>

					<ButtonGroup>
						<CancelButton type="button" onClick={onClose}>
							Cancelar
						</CancelButton>
						<SubmitButton type="submit">
							{initialData ? "Guardar cambios" : "Reportar"}
						</SubmitButton>
					</ButtonGroup>
				</Form>
			</ModalContent>
		</Modal>
	);
}
