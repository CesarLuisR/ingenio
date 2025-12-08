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
  LoadingText,
  // Nuevos componentes de tabla
  TableContainer,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  StatusBadge,
  TableActionButton,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
} from "./styled";

export default function Technicians() {
  const {
    technicians,
    loading,
    meta,
    setPage,
    editing,
    setEditing,
    showForm,
    setShowForm,
    filterStatus,
    setFilterStatus,
    filterText,
    setFilterText,
    refresh,
  } = useTechnicians();

  const { user } = useSessionStore();
  const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

  const handleDelete = async (t: any) => {
    if (!confirm(`¿Seguro que deseas eliminar a ${t.name}?`)) return;
    try {
      await api.deleteTechnician(t.id.toString());
      refresh();
    } catch (e) {
      alert("Error al eliminar técnico. Verifica si tiene mantenimientos asignados.");
    }
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Equipo Técnico</Title>
          <p style={{color: '#64748b', margin: '4px 0 0 0'}}>
            Gestión del personal de mantenimiento
          </p>
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
          placeholder="Buscar por nombre, email o tel..."
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

      {/* CONTENIDO (TABLA) */}
      {loading ? (
        <LoadingText>Cargando técnicos...</LoadingText>
      ) : (
        <>
          {technicians.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#94a3b8', 
              padding: '60px',
              background: '#fff', 
              borderRadius: 12, 
              border: '1px dashed #cbd5e1'
            }}>
              No se encontraron técnicos con estos filtros.
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Técnico</Th>
                    <Th>Estado</Th>
                    <Th>Contacto</Th>
                    <Th style={{textAlign: 'center'}}>Asignaciones</Th>
                    {canManage && <Th style={{textAlign: 'right'}}>Acciones</Th>}
                  </Tr>
                </Thead>
                <tbody>
                  {technicians.map((t) => (
                    <Tr key={t.id}>
                      <Td className="strong">
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span style={{fontSize: 15}}>{t.name}</span>
                        </div>
                      </Td>
                      
                      <Td>
                        <StatusBadge $active={t.active}>
                          {t.active ? "Activo" : "Inactivo"}
                        </StatusBadge>
                      </Td>
                      
                      <Td>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13}}>
                          {t.email && (
                            <span style={{color: '#64748b'}}>
                              📧 {t.email}
                            </span>
                          )}
                          {t.phone && (
                            <span style={{color: '#64748b'}}>
                              📞 {t.phone}
                            </span>
                          )}
                          {!t.email && !t.phone && <span style={{color: '#cbd5e1'}}>—</span>}
                        </div>
                      </Td>
                      
                      <Td className="numeric" style={{textAlign: 'center'}}>
                         <span 
                           title="Mantenimientos asignados" 
                           style={{
                             background: '#eff6ff', 
                             color: '#3b82f6', 
                             padding: '4px 10px', 
                             borderRadius: 8, 
                             fontWeight: 600
                           }}
                         >
                           {(t as any)._count?.maintenances ?? t.maintenances?.length ?? 0}
                         </span>
                      </Td>
                      
                      {canManage && (
                        <Td className="actions">
                          <TableActionButton 
                            $variant="edit"
                            onClick={() => {
                              setEditing(t);
                              setShowForm(true);
                            }}
                          >
                            Editar
                          </TableActionButton>
                          
                          <TableActionButton 
                            $variant="delete"
                            onClick={() => handleDelete(t)}
                          >
                            Eliminar
                          </TableActionButton>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          )}

          {/* PAGINACIÓN */}
          {technicians.length > 0 && (
            <PaginationContainer>
              <PaginationButton 
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </PaginationButton>
              
              <PaginationInfo>
                Pág <strong>{meta.currentPage}</strong> de {meta.totalPages} 
                <span className="total">
                  ({meta.totalItems} total)
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
        <TechnicianForm
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