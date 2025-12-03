import { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import IngenioForm from "./components/IngenioForm";
import { type Ingenio } from "../../types";

import {
  Container,
  Header,
  HeaderGroup,
  Title,
  Subtitle,
  AddButton,
  FilterBar,
  InputGroup,
  Label,
  TextInput,
  SelectInput,
  PrimaryButton,
  IngeniosList,
  ListHeader,
  ListItem,
  ItemLeft,
  ItemName,
  ItemSub,
  Actions,
  ActionButton,
  PaginationContainer,
  PageInfo,
  PaginationButton
} from "./styled";

export default function IngeniosPage() {
  // ---- CONFIG ----
  const API_LIMIT = 50;
  const UI_LIMIT = 10;

  // ---- STATE ----
  const [ingeniosBuffer, setIngeniosBuffer] = useState<Ingenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [apiPage, setApiPage] = useState(1);
  const [uiPage, setUiPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingenio | null>(null);

  // Filters
  const [tempFilters, setTempFilters] = useState({
    search: "",
    active: "all"
  });

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    active: "all"
  });

  // ---- LOAD DATA ----
  const loadData = useCallback(
    async (reset = false) => {
      try {
        if (reset) setLoading(true);

        const params: any = {
          page: reset ? 1 : apiPage,
          limit: API_LIMIT
        };

        if (appliedFilters.search) params.search = appliedFilters.search;
        if (appliedFilters.active !== "all")
          params.active = appliedFilters.active;

        const response = await api.getAllIngenios(params);

        if (reset) {
          setIngeniosBuffer(response.data);
          setTotalItems(response.meta.totalItems);
        } else {
          setIngeniosBuffer(prev => {
            const ids = new Set(prev.map(i => i.id));
            const newItems = response.data.filter(i => !ids.has(i.id));
            return [...prev, ...newItems];
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [apiPage, appliedFilters]
  );

  // Trigger load
  useEffect(() => {
    if (apiPage > 1) loadData(false);
    else loadData(true);
  }, [apiPage, appliedFilters]);

  // Pagination calculations
  const startIndex = (uiPage - 1) * UI_LIMIT;
  const endIndex = startIndex + UI_LIMIT;
  const visibleIngenios = ingeniosBuffer.slice(startIndex, endIndex);

  useEffect(() => {
    const needMore =
      endIndex >= ingeniosBuffer.length &&
      ingeniosBuffer.length < totalItems &&
      ingeniosBuffer.length > 0;

    if (needMore) {
      setApiPage(prev => prev + 1);
    }
  }, [uiPage, ingeniosBuffer.length, totalItems, endIndex]);

  // --- FILTER HANDLERS ---
  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setApiPage(1);
    setUiPage(1);
    setIngeniosBuffer([]);
  };

  // ---- RENDER ----
  const totalUiPages = Math.ceil(totalItems / UI_LIMIT);

  return (
    <Container>
      <Header>
        <HeaderGroup>
          <Title>Gestión de Ingenios</Title>
          <Subtitle>Administración global del sistema</Subtitle>
        </HeaderGroup>

        <AddButton
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nuevo Ingenio
        </AddButton>
      </Header>

      {/* FILTER BAR */}
      <FilterBar>
        <InputGroup>
          <Label>Búsqueda</Label>
          <TextInput
            placeholder="Nombre, código, ubicación..."
            value={tempFilters.search}
            onChange={e =>
              setTempFilters(prev => ({ ...prev, search: e.target.value }))
            }
          />
        </InputGroup>

        <InputGroup>
          <Label>Estado</Label>
          <SelectInput
            value={tempFilters.active}
            onChange={e =>
              setTempFilters(prev => ({ ...prev, active: e.target.value }))
            }
          >
            <option value="all">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </SelectInput>
        </InputGroup>

        <PrimaryButton onClick={applyFilters}>🔍 Buscar</PrimaryButton>
      </FilterBar>

      {/* LIST */}
      <IngeniosList>
        <ListHeader>Ingenios Registrados</ListHeader>

        {loading && apiPage === 1 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-secondary)"
            }}
          >
            Cargando...
          </div>
        ) : visibleIngenios.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-secondary)"
            }}
          >
            No se encontraron ingenios.
          </div>
        ) : (
          visibleIngenios.map(ing => (
            <ListItem key={ing.id}>
              <ItemLeft>
                <ItemName>{ing.name}</ItemName>
                <ItemSub>{ing.location || "Sin ubicación"}</ItemSub>
              </ItemLeft>

              <Actions>
                <ActionButton onClick={() => {
                  setEditing(ing);
                  setShowForm(true);
                }}>
                  Editar
                </ActionButton>

                <ActionButton
                  $danger
                  onClick={async () => {
                    if (confirm(`¿Eliminar ${ing.name}?`)) {
                      await api.deleteIngenio(ing.id);
                      applyFilters();
                    }
                  }}
                >
                  Eliminar
                </ActionButton>
              </Actions>
            </ListItem>
          ))
        )}

        {/* PAGINATION */}
        {totalItems > 0 && (
          <PaginationContainer>
            <div>
              <PaginationButton
                disabled={uiPage === 1}
                onClick={() => setUiPage(1)}
              >
                ⇤ Primera
              </PaginationButton>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <PageInfo>
                Página {uiPage} de {totalUiPages}
              </PageInfo>

              <div>
                <PaginationButton
                  disabled={uiPage === 1}
                  onClick={() => setUiPage(p => p - 1)}
                >
                  Anterior
                </PaginationButton>

                <PaginationButton
                  disabled={uiPage >= totalUiPages}
                  onClick={() => setUiPage(p => p + 1)}
                >
                  Siguiente
                </PaginationButton>
              </div>
            </div>
          </PaginationContainer>
        )}
      </IngeniosList>

      {/* MODAL */}
      {showForm && (
        <IngenioForm
          initialData={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditing(null);
            applyFilters(); // recarga limpia con filtros activos
          }}
        />
      )}
    </Container>
  );
}
