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
    StatBox, // <--- Nuevo
    TagRow,
    StatusTag,
    Tag,
    ActionsRow,
    IconButton,
    PrimaryActionButton, // <--- Nuevo
    DangerousButton,
} from "../styled";
import { ROLES } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";
// import { useMemo } from "react";

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

    // const statusText = useMemo(() => {
    //     if (!machine.active) return "Fuera de servicio";
    //     if (failCount > 0) return "Incidencias";
    //     return "Normal";
    // }, [machine.active, failCount]);

    return (
        // Pasamos el prop data-active para la barra de color lateral
        <Card data-active={machine.active}> 
            <CardHeader>
                <MachineMain>
                    <MachineName title={machine.name}>
                        {machine.name}
                    </MachineName>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <SmallText>
                            <strong>{machine.code}</strong>
                        </SmallText>
                        {machine.type && <Tag>{machine.type}</Tag>}
                    </div>
                    
                    <SecondaryLine>
                        {machine.location && <span>📍 {machine.location}</span>}
                        <span>📅 {new Date(machine.createdAt).toLocaleDateString()}</span>
                    </SecondaryLine>
                </MachineMain>

                <TagRow>
                    <StatusTag $active={machine.active}>
                        {machine.active ? "Activa" : "Inactiva"}
                    </StatusTag>
                    {/* Mostramos un tag extra si hay fallas */}
                    {failCount > 0 && (
                         <Tag style={{ color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca' }}>
                            ⚠️ Atención
                         </Tag>
                    )}
                </TagRow>
            </CardHeader>

            {/* Nueva visualización de estadísticas en cuadrícula */}
            <InfoList>
                <StatBox>
                    <span>Sensores</span>
                    <span>{sensorsCount}</span>
                </StatBox>
                <StatBox>
                    <span>Mantenim.</span>
                    <span>{maintCount}</span>
                </StatBox>
                <StatBox>
                    <span>Fallas</span>
                    <span style={{ color: failCount > 0 ? '#ef4444' : 'inherit' }}>{failCount}</span>
                </StatBox>
            </InfoList>

            <ActionsRow>
                <PrimaryActionButton onClick={() => onView(machine)}>
                    Ver Detalles
                </PrimaryActionButton>
                {canManage && (
                    <>
                        <IconButton onClick={() => onEdit(machine)}>Editar</IconButton>
                        <DangerousButton onClick={() => onDelete(machine)} title="Eliminar">
                            🗑
                        </DangerousButton>
                    </>
                )}
            </ActionsRow>
        </Card>
    );
}