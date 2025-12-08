import { useMemo } from "react";
import FailureForm from "./components/FailureForm";
import {
  Button,
  Container,
  EditButton,
  FiltersBar,
  Header,
  LoadingText,
  SelectInput,
  SeverityTag,
  StatusTag,
  TextInput,
  Title,
  // Nuevos componentes de tabla
  TableContainer,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
} from "./styled";

import SearchableSelect from "../shared/components/SearchableSelect";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
import useFailures from "./hooks/useFailures";

export default function Fallos() {
  const {
    failures,
    machines,
    sensors,
    loading,
    meta,
    setPage,
    
    editing,
    setEditing,
    showForm,
    setShowForm,

    filterMachineId, setFilterMachineId,
    filterSensorId, setFilterSensorId,
    filterSeverity, setFilterSeverity,
    filterStatus, setFilterStatus,
    filterText, setFilterText,

    refresh,
  } = useFailures();

  const { user } = useSessionStore();
  const canReport = hasPermission(user?.role || "", ROLES.TECNICO);
  const canEdit = hasPermission(user?.role || "", ROLES.ADMIN);

  // Opciones para SearchableSelect - Máquinas
  const machineOptions = useMemo(() => {
    const all = { id: 0, name: "Todas las máquinas", code: "" };
    const mapped = machines.map(m => ({ id: m.id, name: m.name, code: m.code || "" }));
    return [all, ...mapped];
  }, [machines]);

  // Opciones para SearchableSelect - Sensores
  const sensorOptions = useMemo(() => {
    const all = { id: 0, name: "Todos los sensores", code: "" };
    const mapped = sensors.map(s => ({ id: s.id, name: s.name, code: "" }));
    return [all, ...mapped];
  }, [sensors]);

  return (
    <Container>
      <Header>
        <div>
          <Title>Registro de Fallas</Title>
          <p style={{color: '#64748b', margin: '4px 0 0 0'}}>
            Seguimiento de incidencias críticas
          </p>
        </div>
        {canReport && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}>
            + Reportar Falla
          </Button>
        )}
      </Header>

      {/* BARRA DE FILTROS */}
      <FiltersBar>
        <div style={{ width: 250, zIndex: 30 }}>
          <SearchableSelect
            options={machineOptions}
            value={Number(filterMachineId) || 0}
            onChange={(val) => setFilterMachineId(val === 0 ? "" : val.toString())}
            placeholder="Todas las máquinas"
          />
        </div>

        <div style={{ width: 250, zIndex: 30 }}>
          <SearchableSelect
            options={sensorOptions}
            value={Number(filterSensorId) || 0}
            onChange={(val) => setFilterSensorId(val === 0 ? "" : val.toString())}
            placeholder="Todos los sensores"
          />
        </div>

        <SelectInput
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="">Todas las severidades</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
          <option value="Crítica">Crítica</option>
        </SelectInput>

        <SelectInput
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en reparación">En reparación</option>
          <option value="resuelta">Resuelta</option>
        </SelectInput>

        <TextInput
          placeholder="Buscar..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ flex: 1 }}
        />
      </FiltersBar>

      {/* TABLA DE FALLAS */}
      {loading ? (
        <LoadingText>Cargando datos...</LoadingText>
      ) : (
        <>
          {failures.length === 0 ? (
            <div style={{
              textAlign: 'center', 
              color: '#94a3b8', 
              padding: '60px',
              background: '#fff', 
              borderRadius: 12, 
              border: '1px dashed #cbd5e1'
            }}>
              No se encontraron fallas con estos filtros.
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Estado</Th>
                    <Th>Severidad</Th>
                    <Th>Dispositivo</Th>
                    <Th>Descripción</Th>
                    <Th>Detectado</Th>
                    <Th>Resuelto</Th>
                    {canEdit && <Th style={{textAlign: 'right'}}>Acciones</Th>}
                  </Tr>
                </Thead>
                <tbody>
                  {failures.map((f) => {
                    const machine = f.machine || machines.find((m) => m.id === f.machineId);
                    const sensor = f.sensor || sensors.find((s) => s.id === f.sensorId);

                    return (
                      <Tr key={f.id}>
                        <Td>
                          <StatusTag $sts={f.status || "pendiente"}>
                            {f.status || "pendiente"}
                          </StatusTag>
                        </Td>
                        
                        <Td>
                          <SeverityTag $sev={f.severity || "Media"}>
                            {f.severity || "Media"}
                          </SeverityTag>
                        </Td>
                        
                        <Td className="strong">
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                            <span>{machine?.name || `Máquina ${f.machineId}`}</span>
                            {sensor && (
                              <span style={{fontSize: 11, color: '#64748b', fontWeight: 400}}>
                                📡 {sensor.name}
                              </span>
                            )}
                          </div>
                        </Td>
                        
                        <Td>
                          <div className="truncate" title={f.description}>
                            {f.description}
                          </div>
                        </Td>
                        
                        <Td className="numeric">
                          {new Date(f.occurredAt).toLocaleDateString()}
                          <div style={{fontSize: 11, color: '#94a3b8'}}>
                             {new Date(f.occurredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </Td>
                        
                        <Td className="numeric">
                          {f.resolvedAt ? (
                            <span style={{color: '#15803d'}}>
                              {new Date(f.resolvedAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span style={{color: '#cbd5e1'}}>—</span>
                          )}
                        </Td>
                        
                        {canEdit && (
                          <Td className="actions">
                            <EditButton
                              onClick={() => {
                                setEditing(f);
                                setShowForm(true);
                              }}>
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

          {/* CONTROLES DE PAGINACIÓN */}
          {failures.length > 0 && (
            <PaginationContainer>
              <PaginationButton 
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </PaginationButton>
              
              <PaginationInfo>
                Página <strong>{meta.currentPage}</strong> de {meta.totalPages} 
                <span className="total">
                  ({meta.totalItems} registros)
                </span>
              </PaginationInfo>

              <PaginationButton 
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente →
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}

      {showForm && (
        <FailureForm
          machines={machines}
          sensors={sensors}
          initialData={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={() => {
            refresh();
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </Container>
  );
}