import type React from "react";
import MaintenanceForm from "./components/MaintenanceForm";
import { useMaintenancesLogic } from "./hooks/useMaintenanceLogic";
import {
	Button,
	CardHeader,
	CloseIconButton,
	Container,
	Description,
	EditButton,
	ErrorText,
	FailureTag,
	Field,
	FiltersBar,
	Header,
	ImportButton,
	InfoList,
	LoadingText,
	MaintenanceCard,
	MaintenanceList,
	Modal,
	ModalContent,
	ModalTitle,
	SelectInput,
	SensorName,
	Tag,
	TagRow,
	TextInput,
	Title,
	TypeTag,
} from "./styled";
import { formatMoney } from "./utils";

export default function Mantenimientos() {
	const {
		loading,
		machines,
		technicians,
		failures,
		editing,
		showForm,
		handleEdit,
		setShowForm,
		filteredMaintenances,
		loadData,

		// importación
		showImport,
		setShowImport,
		importing,
		importError,
		importSummary,
		handleImportExcel,

		// filtros
		filterMachineId,
		setFilterMachineId,
		filterTechnicianId,
		setFilterTechnicianId,
		filterType,
		setFilterType,
		filterHasFailures,
		setFilterHasFailures,
		filterText,
		setFilterText,
	} = useMaintenancesLogic();

	if (loading) {
		return <LoadingText>Cargando mantenimientos...</LoadingText>;
	}

	return (
		<Container>
			<Header>
				<Title>Mantenimientos</Title>
				<div style={{ display: "flex", gap: "12px" }}>
					<ImportButton onClick={() => setShowImport(true)}>
						Importar desde Excel
					</ImportButton>
					<Button
						onClick={() => {
							handleEdit(null as any);
						}}>
						+ Nuevo Mantenimiento
					</Button>
				</div>
			</Header>

			{importSummary && (
				<p
					style={{
						fontSize: 13,
						color: "#4b5563",
						marginBottom: 12,
						whiteSpace: "pre-wrap",
					}}>
					{importSummary}
				</p>
			)}

			{/* Filtros */}
			<FiltersBar>
				{/* Filtro por máquina */}
				<SelectInput
					value={filterMachineId}
					onChange={(e) => setFilterMachineId(e.target.value)}>
					<option value="">Todas las máquinas</option>
					{machines.map((m) => (
						<option key={m.id} value={m.id}>
							{m.name}
							{m.code ? ` (${m.code})` : ""}
						</option>
					))}
				</SelectInput>

				<SelectInput
					value={filterTechnicianId}
					onChange={(e) => setFilterTechnicianId(e.target.value)}>
					<option value="">Todos los técnicos</option>
					{technicians.map((t) => (
						<option key={t.id} value={t.id}>
							{t.name}
						</option>
					))}
				</SelectInput>

				<SelectInput
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}>
					<option value="">Todos los tipos</option>
					<option value="Preventivo">Preventivo</option>
					<option value="Correctivo">Correctivo</option>
					<option value="Predictivo">Predictivo</option>
				</SelectInput>

				<SelectInput
					value={filterHasFailures}
					onChange={(e) => setFilterHasFailures(e.target.value)}>
					<option value="">Con / sin fallas</option>
					<option value="yes">Con fallas</option>
					<option value="no">Sin fallas</option>
				</SelectInput>

				<TextInput
					placeholder="Buscar..."
					value={filterText}
					onChange={(e) => setFilterText(e.target.value)}
				/>
			</FiltersBar>

			<MaintenanceList>
				{filteredMaintenances.map((m) => {
					const machine = machines.find((mc) => mc.id === m.machineId) ?? m.machine;
					const tech =
						m.technician ??
						technicians.find((t) => t.id === m.technicianId);

					const relatedFailures = failures.filter(
						(f) =>
							f.machineId === m.machineId ||
							f.maintenanceId === m.id
					);

					return (
						<MaintenanceCard key={m.id}>
							<CardHeader>
								<SensorName>
									{machine?.name || `Máquina ${m.machineId}`}
									{machine?.code ? ` (${machine.code})` : ""}
								</SensorName>
								<EditButton onClick={() => handleEdit(m)}>
									Editar
								</EditButton>
							</CardHeader>

							<TagRow>
								<TypeTag $type={m.type}>Tipo: {m.type}</TypeTag>
								{tech && <Tag>👤 {tech.name}</Tag>}
								{m.durationMinutes != null && (
									<Tag>⏱ {m.durationMinutes} min</Tag>
								)}
								{m.cost != null && (
									<Tag>💰 {formatMoney(m.cost)}</Tag>
								)}
							</TagRow>

							<Description>
								📅 Realizado:{" "}
								{new Date(m.performedAt).toLocaleString()}
							</Description>

							<InfoList>
								{m.notes && (
									<p>
										<span>📝 Notas:</span>
										<span>{m.notes}</span>
									</p>
								)}

								{relatedFailures.length > 0 && (
									<p>
										<span>⚠️ Fallas:</span>
										<span>
											{relatedFailures.length} registrada
											{relatedFailures.length > 1 && "s"}
										</span>
									</p>
								)}
							</InfoList>

							{relatedFailures.length > 0 && (
								<div
									style={{
										marginTop: 8,
										borderTop: "1px dashed #e5e7eb",
										paddingTop: 6,
									}}>
									<div
										style={{
											fontSize: 12,
											color: "#6b7280",
											marginBottom: 4,
										}}>
										Detalle de fallas
									</div>

									{relatedFailures.map((f) => (
										<div
											key={f.id}
											style={{
												display: "flex",
												flexWrap: "wrap",
												gap: 6,
												alignItems: "center",
												fontSize: 12,
												color: "#4b5563",
											}}>
											<FailureTag $status={f.status}>
												{f.status || "sin estado"}
											</FailureTag>
											{f.severity && (
												<Tag>{f.severity}</Tag>
											)}
											<span>
												{f.description} —{" "}
												{new Date(
													f.occurredAt
												).toLocaleDateString()}
											</span>
											{f.resolvedAt && (
												<span
													style={{
														color: "#16a34a",
													}}>
													(Resuelta el{" "}
													{new Date(
														f.resolvedAt
													).toLocaleDateString()}
													)
												</span>
											)}
										</div>
									))}
								</div>
							)}
						</MaintenanceCard>
					);
				})}
			</MaintenanceList>

			{showForm && (
				<MaintenanceForm
					machines={machines}
					technicians={technicians}
					initialData={editing}
					onClose={() => {
						setShowForm(false);
					}}
					onSave={() => {
						loadData();
						setShowForm(false);
					}}
				/>
			)}

			{showImport && (
				<Modal onClick={() => setShowImport(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<CloseIconButton
							aria-label="Cerrar"
							onClick={() => setShowImport(false)}>
							×
						</CloseIconButton>

						<ModalTitle>Importar Mantenimientos</ModalTitle>

						<Field>
							<label>Archivo Excel</label>
							<TextInput
								as="input"
								type="file"
								accept=".xlsx,.xls"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => {
									const file = e.target.files?.[0];
									if (file) handleImportExcel(file);
								}}
							/>

							<small style={{ fontSize: 11, color: "#6b7280" }}>
								Columnas esperadas:{" "}
								<strong>
									machine, type, technician, performedAt,
									durationMinutes, cost, notes
								</strong>
							</small>
						</Field>

						{importing && <p>Procesando archivo...</p>}
						{importError && <ErrorText>{importError}</ErrorText>}
					</ModalContent>
				</Modal>
			)}
		</Container>
	);
}
