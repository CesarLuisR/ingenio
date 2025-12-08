import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Hooks y Servicios
import { useMachines, type MachineWithRelations } from "./hooks/useMachine";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES, type Ingenio } from "../../types";

// Componentes UI
import { MachineFormModal } from "./components/MachineModal";
import { MachineCard } from "./components/MachineCard";
import SearchableSelect from "../shared/components/SearchableSelect";

import {
  Container,
  Header,
  HeaderRight,
  Title,
  SubTitle,
  ListSummary,
  Button,
  MachineList,
  LoadingText,
  ErrorBox,
  EmptyState,
  FiltersBar,
  FiltersRight,
  CheckboxLabel,
  ResetFiltersButton,
  SortDirButton,
  TextInput,
  SelectInput,
  SearchButton,
  PaginationContainer,
  PageInfo,
  NavButton,
} from "./styled";

type SortField = "name" | "code" | "createdAt";

export default function MachinesPage() {
  const navigate = useNavigate();
  const { user } = useSessionStore();

  const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
  const canManage = hasPermission(user?.role || "", ROLES.ADMIN) && !isSuperAdmin;

  // --- LÓGICA DE INGENIOS (SuperAdmin) ---
  const [ingenios, setIngenios] = useState<Ingenio[]>([]);
  const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isSuperAdmin) {
      api.ingenios.getList().then(setIngenios).catch(console.error);
    }
  }, [isSuperAdmin]);

  const ingenioOptions = useMemo(() => {
    const allOption = { id: 0, name: "🏢 Todos los Ingenios", code: "" };
    return [allOption, ...ingenios];
  }, [ingenios]);

  // --- ESTADOS DE FILTRO (UI TEMPORAL) ---
  const [tempSearch, setTempSearch] = useState("");
  const [tempOnlyActive, setTempOnlyActive] = useState(false);
  const [tempSortField, setTempSortField] = useState<SortField>("name");
  const [tempSortDir, setTempSortDir] = useState<"asc" | "desc">("asc");

  // --- ESTADOS DE FILTRO APLICADOS (ENVIADOS AL HOOK) ---
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    active: false,
    sortBy: "name",
    sortDir: "asc" as "asc" | "desc"
  });

  // --- HOOK PRINCIPAL ---
  const { 
    visibleMachines, 
    loading, 
    error, 
    setMachines, 
    pagination, 
    reload 
  } = useMachines({
    ingenioId: selectedIngenioId,
    // Aquí pasamos los filtros APLICADOS, no los temporales
    search: appliedFilters.search,
    active: appliedFilters.active ? true : undefined,
    sortBy: appliedFilters.sortBy,
    sortDir: appliedFilters.sortDir
  });

  // --- MODALES ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedMachine, setSelectedMachine] = useState<MachineWithRelations | null>(null);

  // --- HANDLERS ---

  // 1. Aplicar Filtros (Botón Buscar)
  const handleApplyFilters = () => {
    setAppliedFilters({
      search: tempSearch,
      active: tempOnlyActive,
      sortBy: tempSortField,
      sortDir: tempSortDir
    });
    // El hook useMachines detectará el cambio en appliedFilters y recargará automáticamente
  };

  // 2. Resetear Filtros
  const handleResetFilters = () => {
    // Reset UI
    setTempSearch("");
    setTempOnlyActive(false);
    setTempSortField("name");
    setTempSortDir("asc");
    
    // Reset Aplicados (Dispara recarga limpia)
    setAppliedFilters({
      search: "",
      active: false,
      sortBy: "name",
      sortDir: "asc"
    });
  };

  // 3. Enter en input de búsqueda
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApplyFilters();
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedMachine(null);
    setModalOpen(true);
  };

  const openEditModal = (machine: MachineWithRelations) => {
    setModalMode("edit");
    setSelectedMachine(machine);
    setModalOpen(true);
  };

  const handleSaved = (saved: MachineWithRelations) => {
    setMachines((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      if (exists) {
        return prev.map((m) => (m.id === saved.id ? { ...m, ...saved } : m));
      }
      return [saved, ...prev];
    });
    reload(); 
  };

  const handleDelete = async (machine: MachineWithRelations) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar la máquina "${machine.name}"?`
    );
    if (!confirmDelete) return;

    try {
      await api.deleteMachine(machine.id);
      setMachines((prev) => prev.filter((m) => m.id !== machine.id));
    } catch (err: any) {
      alert(err?.message || "Error al eliminar la máquina.");
    }
  };

  const handleView = (machine: MachineWithRelations) => {
    if (isSuperAdmin) return;
    navigate(`/maquinas/${machine.id}`);
  };

  return (
    <Container>
      <Header>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Title>Máquinas</Title>

            {isSuperAdmin && (
              <div style={{ zIndex: 50 }}> 
                <SearchableSelect
                  options={ingenioOptions}
                  value={selectedIngenioId ?? 0}
                  onChange={(val) => setSelectedIngenioId(val === 0 ? undefined : val)}
                  placeholder="Buscar ingenio..."
                />
              </div>
            )}
          </div>

          <SubTitle>
            Inventario de equipos del ingenio. Inspecciona sensores, estado, mantenimientos y fallas.
          </SubTitle>

          <ListSummary>
            <span>Total Global: {pagination.totalItems}</span>
            {/* Nota: Los contadores de estado (operativas/inactivas) requieren un endpoint de stats dedicado 
                si se quiere el conteo real de toda la BD, aquí mostramos el total paginado */}
          </ListSummary>
        </div>

        <HeaderRight>
          {canManage && <Button onClick={openCreateModal}>Nueva máquina</Button>}
        </HeaderRight>
      </Header>

      {/* --- BARRA DE FILTROS --- */}
      <FiltersBar>
        {/* INPUT DE BÚSQUEDA */}
        <TextInput
          placeholder="Buscar por nombre, código o ubicación…"
          value={tempSearch}
          onChange={(e) => setTempSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* SELECT DE ORDENAMIENTO */}
        <SelectInput
          value={tempSortField}
          onChange={(e) => setTempSortField(e.target.value as SortField)}
        >
          <option value="name">Ordenar por nombre</option>
          <option value="code">Ordenar por código</option>
          <option value="createdAt">Ordenar por fecha de creación</option>
        </SelectInput>

        <FiltersRight>
          {/* BOTÓN DE DIRECCIÓN (ASC/DESC) */}
          <SortDirButton
            type="button"
            onClick={() => setTempSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            {tempSortDir === "asc" ? "Ascendente ↑" : "Descendente ↓"}
          </SortDirButton>

          {/* CHECKBOX ACTIVAS */}
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={tempOnlyActive}
              onChange={(e) => setTempOnlyActive(e.target.checked)}
            />
            Solo activas
          </CheckboxLabel>

          {/* BOTÓN DE ACCIÓN PRINCIPAL */}
          <SearchButton onClick={handleApplyFilters}>
             Buscar
          </SearchButton>

          {/* BOTÓN DE RESET */}
          <ResetFiltersButton type="button" onClick={handleResetFilters}>
            Reiniciar
          </ResetFiltersButton>
        </FiltersRight>
      </FiltersBar>

      {/* --- ESTADOS DE CARGA Y ERROR --- */}
      {loading && pagination.page === 1 && <LoadingText>Cargando máquinas…</LoadingText>}
      {error && !loading && <ErrorBox>{error}</ErrorBox>}

      {!loading && !error && visibleMachines.length === 0 && (
        <EmptyState>
          <p>No se encontraron máquinas con los filtros actuales.</p>
          {canManage && (
            <button type="button" onClick={openCreateModal}>
              Registrar máquina
            </button>
          )}
        </EmptyState>
      )}

      {/* --- LISTA DE MÁQUINAS --- */}
      {!error && visibleMachines.length > 0 && (
        <>
            <MachineList>
                {visibleMachines.map((m) => (
                    <MachineCard
                    key={m.id}
                    machine={m}
                    onView={handleView}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    />
                ))}
            </MachineList>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {pagination.totalItems > 0 && (
                <PaginationContainer>
                    <PageInfo>
                        Página {pagination.page} de {pagination.totalPages} 
                        <span style={{fontSize: '0.9em', color: '#94a3b8', marginLeft: 8}}>
                             ({pagination.totalItems} registros)
                        </span>
                    </PageInfo>

                    <div style={{display: 'flex', gap: 8}}>
                        <NavButton 
                            onClick={pagination.prevPage} 
                            disabled={!pagination.canPrev}
                        >
                            Anterior
                        </NavButton>
                        <NavButton 
                            onClick={pagination.nextPage} 
                            disabled={!pagination.canNext}
                        >
                            Siguiente
                        </NavButton>
                    </div>
                </PaginationContainer>
            )}
        </>
      )}

      <MachineFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        onSaved={handleSaved}
        initialMachine={modalMode === "edit" ? selectedMachine : null}
      />
    </Container>
  );
}