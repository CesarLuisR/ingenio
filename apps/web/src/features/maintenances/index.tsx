import { useMemo } from "react";
import MaintenanceForm from "./components/MaintenanceForm";
import { useMaintenancesLogic } from "./hooks/useMaintenanceLogic";

// Asegúrate de que tu archivo 'styled.ts' exporte los nuevos componentes de tabla
// (TableContainer, Table, Thead, Tbody, Tr, Th, Td) además de los existentes.
import {
  Button,
  Container,
  EditButton,
  FiltersBar,
  Header,
  ImportButton,
  LoadingText,
  Modal,
  ModalContent,
  ModalTitle,
  CloseIconButton,
  SelectInput,
  TextInput,
  Title,
  TypeTag,
  ReportContainer,
  ReportHeader,
  ReportStats,
  StatBadge,
  ReportContent,
  LogRow,
  ReportActions,
  ActionButton,
  Field,
  Label,
  PaginationContainer,
  PaginationInfo,
  PaginationButton,
  // Nuevos componentes para la Tabla
  TableContainer,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  // Tbody no suele ser un styled component obligatorio si usas el nativo, 
  // pero si lo definiste en styled.ts, impórtalo. Si no, usa el HTML estándar <tbody>.
} from "./styled";

import { formatMoney } from "./utils";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
import SearchableSelect from "../shared/components/SearchableSelect";

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

    // Filtros directos y su setter
    filters,
    setFilters,

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

  // Memoizar opciones para los SearchableSelect
  const machineOptions = useMemo(() => {
    const all = { id: 0, name: "Todas las máquinas", code: "" };
    const mapped = machines.map((m) => ({ id: m.id, name: m.name, code: m.code || "" }));
    return [all, ...mapped];
  }, [machines]);

  const technicianOptions = useMemo(() => {
    const all = { id: 0, name: "Todos los técnicos" };
    const mapped = technicians.map((t) => ({ id: t.id, name: t.name }));
    return [all, ...mapped];
  }, [technicians]);

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
        {/* Filtro Máquinas con SearchableSelect */}
        <div style={{ width: 250, zIndex: 30 }}>
          <SearchableSelect
            options={machineOptions}
            value={Number(filters.machineId) || 0}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, machineId: val === 0 ? "" : val }))
            }
            placeholder="Todas las máquinas"
          />
        </div>

        {/* Filtro Técnicos con SearchableSelect */}
        <div style={{ width: 250, zIndex: 30 }}>
          <SearchableSelect
            options={technicianOptions}
            value={Number(filters.technicianId) || 0}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, technicianId: val === 0 ? "" : val }))
            }
            placeholder="Todos los técnicos"
          />
        </div>

        <SelectInput
          value={filters.type}
          onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
          style={{ width: 180 }}
        >
          <option value="">Todos los tipos</option>
          <option value="Preventivo">Preventivo</option>
          <option value="Correctivo">Correctivo</option>
          <option value="Predictivo">Predictivo</option>
        </SelectInput>

        <TextInput
          placeholder="Buscar notas..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          style={{ flex: 1 }}
        />
      </FiltersBar>

      {/* --- TABLA DE MANTENIMIENTOS (Data Grid) --- */}
      {loading ? (
        <LoadingText>Cargando registros...</LoadingText>
      ) : (
        <>
          {filteredMaintenances.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                color: "#64748b",
                background: "#fff",
                borderRadius: 12,
                border: "1px dashed #cbd5e1"
              }}
            >
              No se encontraron mantenimientos con estos filtros.
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Estado</Th>
                    <Th>Máquina</Th>
                    <Th>Técnico</Th>
                    <Th>Fecha</Th>
                    <Th>Duración</Th>
                    <Th>Costo</Th>
                    <Th>Detalles</Th>
                    {canEdit && <Th style={{ textAlign: "right" }}>Acciones</Th>}
                  </Tr>
                </Thead>
                <tbody>
                  {filteredMaintenances.map((m) => {
                    const tech =
                      m.technician ?? technicians.find((t) => t.id === m.technicianId);
                    const machine =
                      m.machine ?? machines.find((mc) => mc.id === m.machineId);

                    const nestedFailures = (m as any).failures;
                    const relatedFailures = Array.isArray(nestedFailures)
                      ? nestedFailures
                      : failures.filter((f) => f.maintenanceId === m.id);

                    const hasNotes = m.notes && m.notes.length > 0;

                    return (
                      <Tr key={m.id}>
                        <Td>
                          <TypeTag $type={m.type} style={{ fontSize: '11px', padding: '3px 8px' }}>
                            {m.type}
                          </TypeTag>
                        </Td>
                        
                        <Td className="strong">
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{machine ? machine.name : <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Desconocida</span>}</span>
                            {machine?.code && <span style={{ fontSize: 11, color: '#64748b' }}>{machine.code}</span>}
                          </div>
                        </Td>
                        
                        <Td>
                          {tech ? tech.name : <span style={{color: '#cbd5e1'}}>—</span>}
                        </Td>
                        
                        <Td className="numeric">
                          {new Date(m.performedAt).toLocaleDateString()}
                        </Td>
                        
                        <Td className="numeric" style={{ color: '#64748b' }}>
                          {m.durationMinutes ? `${m.durationMinutes} min` : "—"}
                        </Td>
                        
                        <Td className="numeric" style={{ fontWeight: 600 }}>
                          {formatMoney(m.cost || 0)}
                        </Td>
                        
                        <Td>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {relatedFailures.length > 0 ? (
                              <span 
                                title={`Fallas reportadas:\n${relatedFailures.map((f: any) => `• ${f.description}`).join('\n')}`}
                                style={{ cursor: 'help', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                ⚠️ <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 'bold' }}>{relatedFailures.length}</span>
                              </span>
                            ) : (
                              <span style={{ color: '#e2e8f0', fontSize: 12 }}>✓</span>
                            )}

                            {hasNotes && (
                              <span title={m.notes!} style={{ cursor: 'help', fontSize: 16 }}>
                                📝
                              </span>
                            )}
                          </div>
                        </Td>

                        {canEdit && (
                          <Td className="actions">
                            <EditButton onClick={() => handleEdit(m)}>
                              Editar
                            </EditButton>
                          </Td>
                        )}
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
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
          failures={failures}
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