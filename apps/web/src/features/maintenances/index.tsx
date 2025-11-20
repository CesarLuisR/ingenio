import MaintenanceForm from "./components/MaintenanceForm";
import { useMaintenancesLogic } from "./hooks/useMaintenanceLogic";
import {
    Button,
    CardHeader,
    CardTitleBlock,
    DateText,
    Container,
    EditButton,
    ErrorText,
    Field,
    FiltersBar,
    Header,
    ImportButton,
    InfoGrid,
    InfoItem,
    LoadingText,
    MachineGroupHeader,
    MaintenanceCard,
    MaintenanceList,
    Modal,
    ModalContent,
    ModalTitle,
    CloseIconButton,
    SelectInput,
    SensorName,
    SimpleTag,
    TagRow,
    TextInput,
    Title,
    TypeTag,
    NoteBox,
	Label,
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
        return <LoadingText>Cargando registros...</LoadingText>;
    }

    // Agrupar mantenimientos por máquina
    const maintenancesByMachine = machines.map((machine) => {
        const machineMaintenances = filteredMaintenances
            .filter((m) => m.machineId === machine.id)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
            .slice(0, 3);

        return {
            machine,
            maintenances: machineMaintenances,
        };
    }).filter(group => group.maintenances.length > 0); // Ocultar máquinas sin mantenimientos

    return (
        <Container>
            <Header>
                <div>
                    <Title>Gestión de Mantenimientos</Title>
                    <p style={{color: '#64748b', margin: '4px 0 0 0'}}>Registro histórico y programación de actividades</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <ImportButton onClick={() => setShowImport(true)}>
                        📊 Importar Excel
                    </ImportButton>
                    <Button
                        onClick={() => {
                            handleEdit(null as any);
                        }}>
                        + Nuevo Registro
                    </Button>
                </div>
            </Header>

            {importSummary && (
                <div style={{background: '#eff6ff', padding: 16, borderRadius: 8, marginBottom: 20, color: '#1e40af', border: '1px solid #dbeafe'}}>
                    {importSummary}
                </div>
            )}

            {/* Barra de Filtros Mejorada */}
            <FiltersBar>
                <SelectInput
                    value={filterMachineId}
                    onChange={(e) => setFilterMachineId(e.target.value)}>
                    <option value="">Todas las máquinas</option>
                    {machines.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} {m.code ? `(${m.code})` : ""}
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
                    <option value="">Estado de fallas</option>
                    <option value="yes">Con fallas asociadas</option>
                    <option value="no">Sin fallas</option>
                </SelectInput>

                <TextInput
                    placeholder="🔍 Buscar notas o detalles..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </FiltersBar>

            <MaintenanceList>
                {maintenancesByMachine.map(({ machine, maintenances }) => (
                    <div key={machine.id}>
                        <MachineGroupHeader>
                            🏭 {machine.name} <span style={{color: '#94a3b8', fontWeight: 400}}>— {maintenances.length} registros recientes</span>
                        </MachineGroupHeader>

                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16}}>
                            {maintenances.map((m) => {
                                const tech = m.technician ?? technicians.find((t) => t.id === m.technicianId);
                                const relatedFailures = failures.filter(
                                    (f) => f.machineId === m.machineId || f.maintenanceId === m.id
                                );

                                return (
                                    <MaintenanceCard key={m.id} $type={m.type}>
                                        <CardHeader>
                                            <CardTitleBlock>
                                                <TypeTag $type={m.type}>{m.type}</TypeTag>
                                                <DateText>
                                                    {new Date(m.performedAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </DateText>
                                            </CardTitleBlock>
                                            <EditButton onClick={() => handleEdit(m)}>
                                                Editar
                                            </EditButton>
                                        </CardHeader>

                                        <InfoGrid>
                                            <InfoItem>
                                                <span>Técnico</span>
                                                <span>{tech ? tech.name : "—"}</span>
                                            </InfoItem>
                                            <InfoItem>
                                                <span>Duración</span>
                                                <span>{m.durationMinutes ? `${m.durationMinutes} min` : "—"}</span>
                                            </InfoItem>
                                            <InfoItem>
                                                <span>Costo</span>
                                                <span>{m.cost ? formatMoney(m.cost) : "—"}</span>
                                            </InfoItem>
                                        </InfoGrid>

                                        {m.notes && (
                                            <NoteBox>
                                                📝 {m.notes}
                                            </NoteBox>
                                        )}

                                        {relatedFailures.length > 0 && (
                                            <TagRow style={{marginTop: 8}}>
                                                <SimpleTag style={{color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2'}}>
                                                    ⚠️ {relatedFailures.length} falla(s) asociada(s)
                                                </SimpleTag>
                                            </TagRow>
                                        )}
                                    </MaintenanceCard>
                                );
                            })}
                        </div>
                    </div>
                ))}
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
                <Modal>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseIconButton onClick={() => setShowImport(false)}>×</CloseIconButton>
                        <ModalTitle>Importar Mantenimientos</ModalTitle>

                        <Field>
                            <Label>Archivo Excel</Label>
                            <div style={{padding: 20, border: '2px dashed #cbd5e1', borderRadius: 8, textAlign: 'center', background: '#f8fafc'}}>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImportExcel(file);
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                                Columnas requeridas: machine, type, technician, performedAt, durationMinutes, cost, notes
                            </div>
                        </Field>

                        {importing && <p style={{textAlign: 'center', color: '#2563eb'}}>Procesando archivo...</p>}
                        {importError && <ErrorText>{importError}</ErrorText>}
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
}