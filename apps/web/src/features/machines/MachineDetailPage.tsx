import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMachineDetail } from "./hooks/useMachineDetail";
import {
	Container,
	Header,
	Title,
	SubInfo,
	TagRow,
	Tag,
	StatusTag,
	TabsRow,
	TabButton,
	Section,
	SectionTitle,
	List,
	CardList,
	InfoCard,
	EmptyMessage,
} from "./detailStyled";

export default function MachineDetailPage() {
	const { id } = useParams();
	const machineId = Number(id);

	const {
		machine,
		sensors,
		maintenances,
		failures,
		metrics,
		loading,
		error,
	} = useMachineDetail(machineId);

	const [tab, setTab] = useState<
		"general" | "sensores" | "mantenimientos" | "fallas" | "metricas"
	>("general");

	/* LOADING */
	if (loading)
		return (
			<div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
				Cargando información de la máquina…
			</div>
		);

	/* ERROR */
	if (error)
		return (
			<div
				style={{
					padding: 48,
					textAlign: "center",
					color: "#b91c1c",
					fontWeight: 600,
				}}
			>
				{error}
			</div>
		);

	/* NO MACHINE */
	if (!machine)
		return (
			<div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
				No se encontró la máquina solicitada.
			</div>
		);

	return (
		<Container>
			{/* -------------------------------------- */}
			{/* HEADER */}
			{/* -------------------------------------- */}
			<Header>
				<Title>{machine.name}</Title>

				<SubInfo>
					<span>Código: {machine.code}</span>
					{machine.location && <span>Ubicación: {machine.location}</span>}
					<span>Creada: {new Date(machine.createdAt).toLocaleDateString()}</span>
				</SubInfo>

				<TagRow>
					<StatusTag $active={machine.active}>
						{machine.active ? "Activa" : "Inactiva"}
					</StatusTag>

					{machine.type && <Tag>{machine.type}</Tag>}
					<Tag>{sensors.length} sensores</Tag>
					<Tag>{maintenances.length} mantenimientos</Tag>
					<Tag>{failures.length} fallas</Tag>
				</TagRow>

				<TabsRow>
					<TabButton $active={tab === "general"} onClick={() => setTab("general")}>
						General
					</TabButton>
					<TabButton $active={tab === "sensores"} onClick={() => setTab("sensores")}>
						Sensores
					</TabButton>
					<TabButton
						$active={tab === "mantenimientos"}
						onClick={() => setTab("mantenimientos")}
					>
						Mantenimientos
					</TabButton>
					<TabButton $active={tab === "fallas"} onClick={() => setTab("fallas")}>
						Fallas
					</TabButton>
					<TabButton $active={tab === "metricas"} onClick={() => setTab("metricas")}>
						Métricas
					</TabButton>
				</TabsRow>
			</Header>

			{/* -------------------------------------- */}
			{/* TAB: GENERAL */}
			{/* -------------------------------------- */}
			{tab === "general" && (
				<Section>
					<SectionTitle>Información general</SectionTitle>
					<List>
						<p><strong>Nombre:</strong> {machine.name}</p>
						<p><strong>Código interno:</strong> {machine.code}</p>
						<p><strong>Tipo:</strong> {machine.type ?? "No especificado"}</p>
						<p><strong>Ubicación:</strong> {machine.location ?? "No especificada"}</p>
						<p><strong>Estado:</strong> {machine.active ? "Activa" : "Inactiva"}</p>
						<p><strong>Descripción:</strong> {machine.description ?? "Sin descripción"}</p>
					</List>
				</Section>
			)}

			{/* -------------------------------------- */}
			{/* TAB: SENSORES */}
			{/* -------------------------------------- */}
			{tab === "sensores" && (
				<Section>
					<SectionTitle>Sensores asociados</SectionTitle>

					{sensors.length === 0 ? (
						<EmptyMessage>Esta máquina no tiene sensores registrados.</EmptyMessage>
					) : (
						<CardList>
							{sensors.map((s) => (
								<InfoCard key={s.id}>
									<p className="title">{s.name}</p>
									<p>ID: {s.sensorId}</p>
									<p>Tipo: {s.type}</p>
									<p>Última lectura: {s.lastSeen ? new Date(s.lastSeen).toLocaleString() : "Nunca"}</p>
								</InfoCard>
							))}
                        </CardList>
					)}
				</Section>
			)}

			{/* -------------------------------------- */}
			{/* TAB: MANTENIMIENTOS */}
			{/* -------------------------------------- */}
			{tab === "mantenimientos" && (
				<Section>
					<SectionTitle>Historial de mantenimientos</SectionTitle>

					{maintenances.length === 0 ? (
						<EmptyMessage>No hay mantenimientos registrados.</EmptyMessage>
					) : (
						<CardList>
							{maintenances.map((mt) => (
								<InfoCard key={mt.id}>
									<p className="title">
										{mt.type} • {new Date(mt.performedAt).toLocaleDateString()}
									</p>
									<p>Técnico: {mt.technician?.name ?? "Sin técnico"}</p>
									<p>Duración: {mt.durationMinutes ?? 0} min</p>
									{mt.notes && <p className="notes">Notas: {mt.notes}</p>}
								</InfoCard>
							))}
						</CardList>
					)}
				</Section>
			)}

			{/* -------------------------------------- */}
			{/* TAB: FALLAS */}
			{/* -------------------------------------- */}
			{tab === "fallas" && (
				<Section>
					<SectionTitle>Historial de fallas</SectionTitle>

					{failures.length === 0 ? (
						<EmptyMessage>No hay fallas registradas.</EmptyMessage>
					) : (
						<CardList>
							{failures.map((f) => (
								<InfoCard $error key={f.id}>
									<p className="title">{f.description}</p>
									<p>Severidad: {f.severity ?? "N/A"}</p>
									<p>Estado: {f.status ?? "Desconocido"}</p>
									<p>Fecha: {new Date(f.occurredAt).toLocaleString()}</p>
									{f.resolvedAt && (
										<p className="resolved">
											Resuelta: {new Date(f.resolvedAt).toLocaleString()}
										</p>
									)}
								</InfoCard>
							))}
						</CardList>
					)}
				</Section>
			)}

			{/* -------------------------------------- */}
			{/* TAB: MÉTRICAS */}
			{/* -------------------------------------- */}
			{tab === "metricas" && (
				<Section>
					<SectionTitle>Métricas operativas</SectionTitle>

					{!metrics ? (
						<EmptyMessage>No se encontraron métricas.</EmptyMessage>
					) : (
						<List>
							<p><strong>Disponibilidad:</strong> {metrics.availability ?? "N/A"}</p>
							<p><strong>Confiabilidad:</strong> {metrics.reliability ?? "N/A"}</p>
							<p><strong>MTBF:</strong> {metrics.mtbf ?? "N/A"}</p>
							<p><strong>MTTR:</strong> {metrics.mttr ?? "N/A"}</p>
							<p><strong>MTTA:</strong> {metrics.mtta ?? "N/A"}</p>
						</List>
					)}
				</Section>
			)}
		</Container>
	);
}
