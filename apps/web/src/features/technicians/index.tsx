import TechnicianForm from "./components/TechnicianForm";

import {
    Button,
    CardHeader,
    Container,
    Header,
    InfoList,
    LoadingText,
    Title,
    TechnicianCard,
    TechnicianList,
    Name,
    StatusBadge,
    Actions,
    ActionButton,
    FiltersBar,
    SelectInput,
    TextInput,
} from "./styled";

import useTechnicians from "./hooks/useTechnicians";
import { api } from "../../lib/api";

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

            {/* FILTROS */}
            <FiltersBar>
                <SelectInput
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </SelectInput>

                <TextInput
                    placeholder="Buscar texto..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
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
                                onClick={async () => {
                                    if (!confirm("¿Eliminar técnico permanentemente?")) return;
                                    await api.deleteTechnician(t.id.toString());
                                    loadData();
                                }}>
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
