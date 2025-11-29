import MaintenanceForm from "./components/MaintenanceForm";
import { useMaintenancesLogic } from "./hooks/useMaintenanceLogic";

import {
  Button,
  CardHeader,
  CardTitleBlock,
  DateText,
  Container,
  EditButton,
  FiltersBar,
  Header,
  ImportButton,
  InfoGrid,
  InfoItem,
  LoadingText,
  MaintenanceCard,
  MaintenanceList,
  Modal,
  ModalContent,
  ModalTitle,
  CloseIconButton,
  SelectInput,
  SimpleTag,
  TagRow,
  TextInput,
  Title,
  TypeTag,
  NoteBox,
  Label,
  ReportContainer,
  ReportHeader,
  ReportStats,
  StatBadge,
  ReportContent,
  LogRow,
  ReportActions,
  ActionButton,
  Field,
  PaginationContainer,
  PaginationInfo,
  PaginationButton,
} from "./styled";

import { formatMoney } from "./utils";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";

export default function Mantenimientos() {
  const {
    // Datos
    filteredMaintenances,
    machines,
    technicians,
    failures,
    loading,

    // Paginación
    pagination,

    // NUEVOS filtros controlados
    formFilters,
    setFormFilter,
    applyFilters,

    // Acciones UI
    editing,
    showForm,
    handleEdit,
    setShowForm,
    loadData,

    // Importación
    showImport,
    setShowImport,
    importing,
    importReport,
    setImportReport,
    handleImportExcel,
  } = useMaintenancesLogic();

  const { user } = useSessionStore();
  const canImport = hasPermission(user?.role || "", ROLES.ADMIN);
  const canCreate = hasPermission(user?.role || "", ROLES.TECNICO);
  const canEdit = hasPermission(user?.role || "", ROLES.ADMIN);

  const downloadReportLog = () => {
    if (!importReport) return;
    const text = JSON.stringify(importReport, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-importacion.txt";
    a.click();
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Gestión de Mantenimientos</Title>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>
            Registro histórico y programación de actividades
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {canImport && (
            <ImportButton onClick={() => setShowImport(true)}>📊 Importar Excel</ImportButton>
          )}

          {canCreate && <Button onClick={() => handleEdit(null)}>+ Nuevo Registro</Button>}
        </div>
      </Header>

      {/* --- REPORTE DE IMPORTACIÓN --- */}
      {importReport && (
        <ReportContainer>
          <ReportHeader>
            <h3>📋 Resultado de Importación</h3>
            <ReportStats>
              <StatBadge $type="info">Total: {importReport.total}</StatBadge>
              {importReport.success > 0 && (
                <StatBadge $type="success">Exitosos: {importReport.success}</StatBadge>
              )}
              {importReport.failed > 0 && (
                <StatBadge $type="error">Fallidos: {importReport.failed}</StatBadge>
              )}
            </ReportStats>
          </ReportHeader>

          <ReportContent>
            {importReport.logs.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>
                No se generaron registros de log.
              </div>
            ) : (
              importReport.logs.map((log, idx) => (
                <LogRow key={idx} $type={log.status}>
                  <span style={{ minWidth: 20 }}>
                    {log.status === "success" ? "✅" : "❌"}
                  </span>
                  <strong style={{ color: "#475569" }}>Fila {log.row}:</strong>
                  <span
                    style={{
                      flex: 1,
                      color: log.status === "error" ? "#b91c1c" : "#166534",
                    }}
                  >
                    {log.message}
                  </span>
                </LogRow>
              ))
            )}
          </ReportContent>

          <ReportActions>
            <ActionButton $variant="primary" onClick={downloadReportLog}>
              📥 Descargar Log (.txt)
            </ActionButton>
            <ActionButton
              $variant="secondary"
              onClick={() => setImportReport(null)}
            >
              Cerrar Reporte
            </ActionButton>
          </ReportActions>
        </ReportContainer>
      )}

      {/* --- BARRA DE FILTROS --- */}
      <FiltersBar>
        <SelectInput
          value={formFilters.machineId}
          onChange={(e) => setFormFilter("machineId", e.target.value)}
        >
          <option value="">Todas las máquinas</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} {m.code ? `(${m.code})` : ""}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={formFilters.technicianId}
          onChange={(e) => setFormFilter("technicianId", e.target.value)}
        >
          <option value="">Todos los técnicos</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={formFilters.type}
          onChange={(e) => setFormFilter("type", e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Preventivo">Preventivo</option>
          <option value="Correctivo">Correctivo</option>
          <option value="Predictivo">Predictivo</option>
        </SelectInput>

        <TextInput
          placeholder="🔍 Buscar notas..."
          value={formFilters.search}
          onChange={(e) => setFormFilter("search", e.target.value)}
        />

        <Button onClick={applyFilters}>🔍 Buscar</Button>
      </FiltersBar>

      {/* --- LISTADO DE MANTENIMIENTOS --- */}
      {loading ? (
        <LoadingText>Cargando registros...</LoadingText>
      ) : (
        <>
          {filteredMaintenances.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
              }}
            >
              No se encontraron mantenimientos con estos filtros.
            </div>
          ) : (
            <MaintenanceList>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: 16,
                }}
              >
                {filteredMaintenances.map((m) => {
                  const tech =
                    m.technician ?? technicians.find((t) => t.id === m.technicianId);
                  const machine =
                    m.machine ?? machines.find((mc) => mc.id === m.machineId);
                  const relatedFailures = failures.filter(
                    (f) => f.maintenanceId === m.id
                  );

                  return (
                    <MaintenanceCard key={m.id} $type={m.type}>
                      <CardHeader>
                        <CardTitleBlock>
                          <TypeTag $type={m.type}>{m.type}</TypeTag>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600 }}>
                              {machine ? machine.name : "Máquina desconocida"}
                            </span>
                            <DateText>
                              {new Date(m.performedAt).toLocaleDateString()}
                            </DateText>
                          </div>
                        </CardTitleBlock>
                        {canEdit && (
                          <EditButton onClick={() => handleEdit(m)}>Editar</EditButton>
                        )}
                      </CardHeader>

                      <InfoGrid>
                        <InfoItem>
                          <span>Técnico</span>
                          <span>{tech ? tech.name : "—"}</span>
                        </InfoItem>
                        <InfoItem>
                          <span>Duración</span>
                          <span>
                            {m.durationMinutes ? `${m.durationMinutes} min` : "—"}
                          </span>
                        </InfoItem>
                        <InfoItem>
                          <span>Costo</span>
                          <span>{formatMoney(m.cost || 0)}</span>
                        </InfoItem>
                      </InfoGrid>

                      {m.notes && <NoteBox>📝 {m.notes}</NoteBox>}

                      {relatedFailures.length > 0 && (
                        <TagRow style={{ marginTop: 8 }}>
                          <SimpleTag
                            style={{
                              color: "#dc2626",
                              borderColor: "#fecaca",
                              background: "#fef2f2",
                            }}
                          >
                            ⚠️ {relatedFailures.length} falla(s) asociada(s)
                          </SimpleTag>
                        </TagRow>
                      )}
                    </MaintenanceCard>
                  );
                })}
              </div>
            </MaintenanceList>
          )}

          {/* --- CONTROLES DE PAGINACIÓN --- */}
          {pagination.totalItems > 0 && (
            <PaginationContainer>
              <PaginationButton
                onClick={pagination.prevPage}
                disabled={!pagination.canPrev}
              >
                ← Anterior
              </PaginationButton>

              <PaginationInfo>
                Página <strong>{pagination.page}</strong> de{" "}
                <strong>{pagination.totalPages}</strong>
                <span className="total">
                  ({pagination.totalItems} registros)
                </span>
              </PaginationInfo>

              <PaginationButton
                onClick={pagination.nextPage}
                disabled={!pagination.canNext}
              >
                Siguiente →
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}

      {/* --- MODALES --- */}
      {showForm && (
        <MaintenanceForm
          machines={machines}
          technicians={technicians}
          initialData={editing}
          onClose={() => setShowForm(false)}
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
              <Label>Archivo Excel (.xlsx)</Label>
              <div
                style={{
                  padding: 30,
                  border: "2px dashed #cbd5e1",
                  borderRadius: 8,
                  textAlign: "center",
                  background: "#f8fafc",
                }}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportExcel(file);
                  }}
                  style={{ width: "100%" }}
                />
                <p style={{ marginTop: 10, color: "#64748b" }}>
                  Arrastra o selecciona un archivo
                </p>
              </div>
            </Field>

            {importing && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: 15,
                  fontWeight: 600,
                  color: "#2563eb",
                }}
              >
                Procesando...
              </p>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
