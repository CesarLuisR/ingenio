import FailureForm from "./components/FailureForm";
import {
	Button,
	CardHeader,
	Container,
	Description,
	EditButton,
	FailureCard,
	FailureList,
	FiltersBar,
	Header,
	InfoList,
	LoadingText,
	SelectInput,
	SensorName,
	SeverityTag,
	StatusTag,
	TagRow,
	TextInput,
	Title,
} from "./styled";

import useFailures from "./hooks/useFailures";

export default function Fallos() {
	const {
		machines,
		sensors,
		loading,
		filteredFailures,
		editing,
		setEditing,
		showForm,
		setShowForm,

		filterMachineId,
		setFilterMachineId,
		filterSensorId,
		setFilterSensorId,
		filterSeverity,
		setFilterSeverity,
		filterStatus,
		setFilterStatus,
		filterText,
		setFilterText,

		loadData,
	} = useFailures();

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
				{/* 🔷 Filtrar por máquina */}
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

				{/* 🔶 Filtro por sensor (solo sensores dentro del ingenio) */}
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
				{filteredFailures.map((f) => {
					const machine =
						machines.find((m) => m.id === f.machineId) ?? f.machine;

					const sensor = sensors.find((s) => s.id === f.sensorId);

					return (
						<FailureCard key={f.id}>
							<CardHeader>
								<SensorName>
									{machine?.name || `Máquina ${f.machineId}`}
									{machine?.code ? ` (${machine.code})` : ""}
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

								{sensor && (
									<span
										style={{
											fontSize: 12,
											background: "#f3f4f6",
											padding: "2px 6px",
											borderRadius: 6,
										}}>
										Sensor: {sensor.name}
									</span>
								)}
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
					machines={machines}
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
