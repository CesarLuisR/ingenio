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
    StatBox, 
    TagRow,
    StatusTag,
    Tag,
    ActionsRow,
    IconButton,
    PrimaryActionButton,
    DangerousButton,
} from "../styled";
import { ROLES } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

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

    // --- LÓGICA DE ESTADO ---
    // Filtramos fallas activas (sin fecha de resolución)
    const activeFailures = machine.failures?.filter(f => !f.resolvedAt) || [];
    const hasWarnings = activeFailures.length > 0;

    let statusConfig = {
        text: "Fuera de Servicio",
        style: { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" } // Rojo
    };

    if (machine.active) {
        if (hasWarnings) {
            statusConfig = {
                text: "Advertencia",
                style: { background: "#fffbeb", color: "#d97706", borderColor: "#fcd34d" } // Ámbar
            };
        } else {
            statusConfig = {
                text: "Operativa",
                style: { background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" } // Verde
            };
        }
    }

    return (
        // Pasamos el prop data-active para la barra de color lateral (rojo si inactiva, verde si activa)
        // Nota: Podrías cambiar esto para que la barra lateral también refleje la advertencia si quisieras
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
                    {/* StatusTag con estilos dinámicos in-line para sobrescribir el default */}
                    <StatusTag 
                        $active={machine.active}
                        style={{
                            backgroundColor: statusConfig.style.background,
                            color: statusConfig.style.color,
                            border: `1px solid ${statusConfig.style.borderColor}`
                        }}
                    >
                        {statusConfig.text}
                    </StatusTag>

                    {/* Tag adicional si hay advertencias específicas */}
                    {hasWarnings && (
                         <Tag style={{ color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca', fontWeight: 600 }}>
                            ⚠️ {activeFailures.length} falla(s)
                         </Tag>
                    )}
                </TagRow>
            </CardHeader>

            {/* Visualización de estadísticas */}
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
                    {/* Rojo si hay alguna falla histórica, o podrías usar hasWarnings para solo las activas */}
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