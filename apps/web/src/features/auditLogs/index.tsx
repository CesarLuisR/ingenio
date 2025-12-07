import { useState } from "react";
import { useAuditLogs } from "./hooks/useAuditLogs";
import { LogDetailModal } from "./components/LogDetailModal";
import type { AuditLog } from "../../types";

// Reutilizamos tus estilos existentes
import {
  Container, Header, Title, SubTitle, FiltersBar, FiltersRight,
  TextInput, SelectInput, SearchButton, ResetFiltersButton,
  PaginationContainer, PageInfo, NavButton, LoadingText, ErrorBox, EmptyState
} from "../machines/styled"; // Asume que moviste los estilos de Machines a un lugar compartido, o impórtalos de Machines.styles

import styled from "styled-components";

// --- Estilos Específicos para la Tabla de Logs ---
const TableWrapper = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    text-align: left;
    padding: 16px;
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  td {
    padding: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  tr:last-child td { border-bottom: none; }
  tr:hover { background: #f8fafc; cursor: pointer; }
`;

const ActionBadge = styled.span<{ type: string }>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  
  ${props => props.type === 'CREATE' && `background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;`}
  ${props => props.type === 'UPDATE' && `background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;`}
  ${props => props.type === 'DELETE' && `background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;`}
  ${props => props.type === 'LOGIN' && `background: #fdf4ff; color: #c026d3; border: 1px solid #f5d0fe;`}
`;

// --- COMPONENTE PRINCIPAL ---

export default function AuditPage() {
  // Estado de Filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "", // Usaremos esto para filtrar por ID o Entity
    action: "",
    startDate: "",
    endDate: ""
  });

  const { logs, loading, error, pagination, reload } = useAuditLogs({
    page: filters.page,
    limit: filters.limit,
    entity: filters.search, // Mapeamos search a entity o lo que soporte tu backend
    action: filters.action,
    startDate: filters.startDate,
    endDate: filters.endDate
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Auditoría del Sistema</Title>
          <SubTitle>Registro inmutable de seguridad y cambios en datos.</SubTitle>
        </div>
      </Header>

      {/* --- BARRA DE FILTROS --- */}
      <FiltersBar style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
        {/* Filtro Entidad */}
        <TextInput 
          placeholder="Buscar entidad (Ej: Machine)..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />

        {/* Filtro Acción */}
        <SelectInput 
          value={filters.action}
          onChange={(e) => handleFilterChange("action", e.target.value)}
        >
          <option value="">Todas las acciones</option>
          <option value="CREATE">Creación</option>
          <option value="UPDATE">Edición</option>
          <option value="DELETE">Eliminación</option>
          <option value="LOGIN">Accesos</option>
        </SelectInput>

        {/* Filtro Fecha (Simple) */}
        <div style={{ display: 'flex', gap: 8 }}>
            <TextInput 
                type="date" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <TextInput 
                type="date" 
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
        </div>

        <FiltersRight>
          <SearchButton onClick={reload}>Refrescar</SearchButton>
          <ResetFiltersButton onClick={() => setFilters({ ...filters, search: "", action: "", startDate: "", endDate: "" })}>
            Limpiar
          </ResetFiltersButton>
        </FiltersRight>
      </FiltersBar>

      {/* --- CONTENIDO --- */}
      {loading && <LoadingText>Cargando registros de auditoría...</LoadingText>}
      {error && <ErrorBox>{error}</ErrorBox>}
      
      {!loading && !error && logs.length === 0 && (
        <EmptyState>
          <p>No se encontraron registros con los filtros seleccionados.</p>
        </EmptyState>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>ID Afectado</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} onClick={() => setSelectedLog(log)}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.user?.name || "Sistema"}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{log.user?.email}</div>
                    </td>
                    <td><ActionBadge type={log.action}>{log.action}</ActionBadge></td>
                    <td style={{ fontWeight: 500 }}>{log.entity}</td>
                    <td style={{ fontFamily: 'monospace' }}>#{log.entityId || '-'}</td>
                    <td style={{ color: "#64748b" }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          {/* --- PAGINACIÓN --- */}
          <PaginationContainer>
            <PageInfo>
                Página <strong>{pagination.currentPage}</strong> de <strong>{pagination.totalPages}</strong>
                <span style={{ marginLeft: 10, color: "#94a3b8" }}>({pagination.totalItems} eventos)</span>
            </PageInfo>
            <div style={{ display: 'flex', gap: 8 }}>
                <NavButton 
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                    Anterior
                </NavButton>
                <NavButton 
                    disabled={!pagination.hasNextPage}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                    Siguiente
                </NavButton>
            </div>
          </PaginationContainer>
        </>
      )}

      {/* Modal de Detalle */}
      <LogDetailModal 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </Container>
  );
}