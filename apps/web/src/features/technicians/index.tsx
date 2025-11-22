import TechnicianForm from "./components/TechnicianForm";
import useTechnicians from "./hooks/useTechnicians";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
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

export default function Technicians() {
    const {
        loading,
        filteredTechnicians,
        editing,
        setEditing,
        showForm,
        setShowForm,

        filterStatus,
        setFilterStatus,
        filterText,
        setFilterText,

        loadData,
    } = useTechnicians();

    const { user } = useSessionStore();
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    if (loading) return <LoadingText>Cargando técnicos...</LoadingText>;

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

            {/* FILTROS */}
            <FiltersBar>
                <TextInput
                    placeholder="🔍 Buscar por nombre o email..."
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

            {/* LISTA */}
            <TechnicianList>
                {filteredTechnicians.map((t) => (
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
                                🧰 <strong>{t.maintenances?.length || 0}</strong> asignaciones
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
                                            loadData();
                                        } catch (e) {
                                            alert("Error al eliminar técnico");
                                        }
                                    }}>
                                    Eliminar
                                </ActionButton>
                            </Actions>
                        )}
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