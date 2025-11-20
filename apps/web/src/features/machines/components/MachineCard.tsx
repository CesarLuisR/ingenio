// src/modules/machines/MachineCard.tsx
import type { MachineWithRelations } from "../hooks/useMachine";
import {
	MachineCard as Card,
	CardHeader,
	MachineMain,
	MachineName,
	SmallText,
	SecondaryLine,
	InfoList,
	TagRow,
	StatusTag,
	Tag,
	ActionsRow,
	IconButton,
	DangerousButton,
} from "../styled";
import { ROLES } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";
import { useMemo } from "react";

interface MachineCardProps {
	machine: MachineWithRelations;
	onView: (machine: MachineWithRelations) => void;
	onEdit: (machine: MachineWithRelations) => void;
	onDelete: (machine: MachineWithRelations) => void;
}

export function MachineCard({
	machine,
	onView,
	onEdit,
	onDelete,
}: MachineCardProps) {
	const { user } = useSessionStore();

	const canManage =
		user &&
		(user.role === ROLES.SUPERADMIN || user.role === ROLES.ADMIN);

	const sensorsCount = machine.sensors?.length ?? 0;
	const maintCount = machine.maintenances?.length ?? 0;
	const failCount = machine.failures?.length ?? 0;

	const statusText = useMemo(() => {
		if (!machine.active) return "Fuera de servicio";
		if (failCount > 0) return "Con incidencias registradas";
		return "Operativa";
	}, [machine.active, failCount]);

	return (
		<Card>
			<CardHeader>
				<MachineMain>
					<MachineName title={machine.name}>{machine.name}</MachineName>
					<SmallText>
						Código: <strong>{machine.code}</strong>
						{machine.type ? ` · ${machine.type}` : ""}
					</SmallText>
					<SecondaryLine>
						{machine.location && <span>{machine.location}</span>}
						<span>Creada: {new Date(machine.createdAt).toLocaleDateString()}</span>
						<span>Actualizada: {new Date(machine.updatedAt).toLocaleDateString()}</span>
					</SecondaryLine>
				</MachineMain>

				<TagRow>
					<StatusTag $active={machine.active}>
						{machine.active ? "Activa" : "Inactiva"}
					</StatusTag>
					<Tag>{statusText}</Tag>
				</TagRow>
			</CardHeader>

			<InfoList>
				<p>
					<strong>Sensores:</strong>
					<span>{sensorsCount}</span>
				</p>
				<p>
					<strong>Mantenimientos:</strong>
					<span>{maintCount}</span>
				</p>
				<p>
					<strong>Fallas:</strong>
					<span>{failCount}</span>
				</p>
			</InfoList>

			<ActionsRow>
				<IconButton onClick={() => onView(machine)}>
					Ver detalle
				</IconButton>
				{canManage && (
					<>
						<IconButton onClick={() => onEdit(machine)}>Editar</IconButton>
						<DangerousButton onClick={() => onDelete(machine)}>
							Eliminar
						</DangerousButton>
					</>
				)}
			</ActionsRow>
		</Card>
	);
}
