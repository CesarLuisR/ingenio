import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Technician } from "../../types";

import {
	Container,
	Header,
	Title,
	Button,
	TechnicianCard,
	TechnicianList,
	CardHeader,
	Name,
	StatusBadge,
	InfoList,
	LoadingText,
	Actions,
	ActionButton,
} from "./styled";

import TechnicianForm from "./components/TechnicianForm";

export default function Technicians() {
	const [technicians, setTechnicians] = useState<Technician[]>([]);
	const [loading, setLoading] = useState(true);

	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Technician | null>(null);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const techs = await api.getTechnicians();
			setTechnicians(techs);
		} catch (error) {
			console.error("Error cargando técnicos:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("¿Eliminar técnico permanentemente?")) return;
		try {
			await api.deleteTechnician(id.toString());
			loadData();
		} catch (err) {
			console.error("Error eliminando técnico:", err);
		}
	};

	if (loading) return <LoadingText>Cargando técnicos...</LoadingText>;

	return (
		<Container>
			<Header>
				<Title>Técnicos</Title>
				<Button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}>
					+ Nuevo Técnico
				</Button>
			</Header>

			<TechnicianList>
				{technicians.map((t) => (
					<TechnicianCard key={t.id} $active={t.active}>
						<CardHeader>
							<Name>{t.name}</Name>
							<StatusBadge $active={t.active}>
								{t.active ? "Activo" : "Inactivo"}
							</StatusBadge>
						</CardHeader>

						<InfoList>
							{t.email && <p>📧 {t.email}</p>}
							{t.phone && <p>📞 {t.phone}</p>}
							<p>🧰 Asignaciones: {t.maintenances?.length || 0}</p>
						</InfoList>

						<Actions>
							<ActionButton
								onClick={() => {
									setEditing(t);
									setShowForm(true);
								}}>
								✏️ Editar
							</ActionButton>

							<ActionButton
								$danger
								onClick={() => handleDelete(t.id)}>
								🗑 Eliminar
							</ActionButton>
						</Actions>
					</TechnicianCard>
				))}
			</TechnicianList>

			{showForm && (
				<TechnicianForm
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
