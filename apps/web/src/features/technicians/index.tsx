import TechnicianForm from "./components/TechnicianForm";
import useTechnicians from "./hooks/useTechnicians";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
import styled from "styled-components"; // Necesario para el footer
import {
    Container,
    Header,
    Title,
    Button,
    FiltersBar,
    SelectInput,
    TextInput,
    TechnicianList,
    TechnicianCard,
    CardHeader,
    Name,
    StatusBadge,
    InfoList,
    Actions,
    ActionButton,
    LoadingText,
} from "./styled";

// Estilos para la paginación (Pega esto en tu styled.ts si prefieres)
const PaginationFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding-bottom: 20px;

  button {
    padding: 8px 16px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f1f5f9;
    }
    &:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  }
  
  span {
    color: #475569;
    font-size: 14px;
    font-weight: 500;
  }
`;

export default function Technicians() {
    const {
        technicians, // Ahora es la lista paginada del servidor
        loading,
        meta,       // Info de paginación
        page,
        setPage,

        editing,
        setEditing,
        showForm,
        setShowForm,

        filterStatus,
        setFilterStatus,
        filterText,
        setFilterText,

        refresh, // Usamos refresh para recargar la página actual
    } = useTechnicians();

    const { user } = useSessionStore();
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    return (
        <Container>
            <Header>
                <div>
                    <Title>Equipo Técnico</Title>
                    <p style={{color: '#64748b', margin: '8px 0 0 0'}}>Gestión del personal de mantenimiento</p>
                </div>

                {canManage && (
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}>
                        + Nuevo Técnico
                    </Button>
                )}
            </Header>

            {/* FILTROS (Activan búsqueda en backend) */}
            <FiltersBar>
                <TextInput
                    placeholder="🔍 Buscar por nombre, email o tel..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                
                <SelectInput
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </SelectInput>
            </FiltersBar>

            {/* CONTENIDO */}
            {loading ? (
                <LoadingText>Cargando técnicos...</LoadingText>
            ) : (
                <>
                    <TechnicianList>
                        {technicians.length === 0 && (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                                No se encontraron técnicos con estos filtros.
                            </p>
                        )}
                        {technicians.map((t) => (
                            <TechnicianCard key={t.id} $active={t.active}>
                                <CardHeader>
                                    <Name>{t.name}</Name>
                                    <StatusBadge $active={t.active}>
                                        {t.active ? "Activo" : "Inactivo"}
                                    </StatusBadge>
                                </CardHeader>

                                <InfoList>
                                    {t.email && <p title="Email">📧 {t.email}</p>}
                                    {t.phone && <p title="Teléfono">📞 {t.phone}</p>}
                                    <p title="Mantenimientos asignados">
                                        {/* Accedemos al count del backend o fallback a array length */}
                                        🧰 <strong>{(t as any)._count?.maintenances ?? t.maintenances?.length ?? 0}</strong> asignaciones
                                    </p>
                                </InfoList>

                                {canManage && (
                                    <Actions>
                                        <ActionButton
                                            onClick={() => {
                                                setEditing(t);
                                                setShowForm(true);
                                            }}>
                                            Editar
                                        </ActionButton>

                                        <ActionButton
                                            $danger
                                            onClick={async () => {
                                                if (!confirm(`¿Seguro que deseas eliminar a ${t.name}?`)) return;
                                                try {
                                                    await api.deleteTechnician(t.id.toString());
                                                    refresh(); // Recarga la página actual
                                                } catch (e) {
                                                    alert("Error al eliminar técnico. Verifica si tiene mantenimientos asignados.");
                                                }
                                            }}>
                                            Eliminar
                                        </ActionButton>
                                    </Actions>
                                )}
                            </TechnicianCard>
                        ))}
                    </TechnicianList>

                    {/* PAGINACIÓN */}
                    {technicians.length > 0 && (
                        <PaginationFooter>
                            <button 
                                disabled={!meta.hasPreviousPage}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ← Anterior
                            </button>
                            
                            <span>
                                Pág <strong>{meta.currentPage}</strong> de {meta.totalPages} 
                                <span style={{marginLeft: 8, fontSize: 13, color: '#94a3b8'}}>
                                    ({meta.totalItems} total)
                                </span>
                            </span>

                            <button 
                                disabled={!meta.hasNextPage}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Siguiente →
                            </button>
                        </PaginationFooter>
                    )}
                </>
            )}

            {showForm && (
                <TechnicianForm
                    initialData={editing}
                    onClose={() => {
                        setShowForm(false);
                        setEditing(null);
                    }}
                    onSave={() => {
                        refresh(); // Recargar datos tras guardar
                        setShowForm(false);
                        setEditing(null);
                    }}
                />
            )}
        </Container>
    );
}