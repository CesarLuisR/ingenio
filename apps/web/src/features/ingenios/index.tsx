import styled from "styled-components";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import type { Ingenio } from "../../types";

// --- ESTILOS ---
const Container = styled.div`
  padding: 32px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 8px 0 0 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  align-items: center;
  flex-wrap: wrap;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
`;

const TextInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  &:focus { outline: 2px solid #3b82f6; border-color: transparent; }
`;

const SelectInput = styled.select`
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  background-color: white;
  &:focus { outline: 2px solid #3b82f6; border-color: transparent; }
`;

const PrimaryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end; /* Alinear con los inputs */
  &:hover { background: #2563eb; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
`;

const IngeniosList = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ListHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #0f172a;
`;

const ListItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* Espaciado para el botón "Primera" */
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    color: #0f172a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8fafc;
  }
`;

export default function SuperAdminDashboard() {
    // --- CONFIGURACIÓN DE BÚFER ---
    const API_LIMIT = 50; 
    const UI_LIMIT = 10;  

    // --- ESTADOS ---
    const [stats, setStats] = useState({ totalIngenios: 0, totalUsers: 0 });
    const [ingeniosBuffer, setIngeniosBuffer] = useState<Ingenio[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    // Estado de Paginación
    const [apiPage, setApiPage] = useState(1);
    const [uiPage, setUiPage] = useState(1);

    // --- FILTROS ---
    // 1. Filtros Temporales (Inputs)
    const [tempFilters, setTempFilters] = useState({
        search: "",
        active: "all" // "all", "true", "false"
    });

    // 2. Filtros Aplicados (Se envían a la API)
    const [appliedFilters, setAppliedFilters] = useState({
        search: "",
        active: "all"
    });

    // --- LÓGICA DE CARGA ---
    const loadData = useCallback(async (reset = false) => {
        try {
            if (reset) setLoading(true);

            // Preparamos params para el controlador
            const params: any = {
                page: reset ? 1 : apiPage,
                limit: API_LIMIT,
            };

            // Solo enviamos si hay búsqueda
            if (appliedFilters.search) {
                params.search = appliedFilters.search;
            }

            // Solo enviamos active si no es 'all'
            if (appliedFilters.active !== "all") {
                params.active = appliedFilters.active; // "true" o "false"
            }

            const response = await api.getAllIngenios(params);

            if (reset) {
                // RESET TOTAL (Nueva búsqueda)
                setIngeniosBuffer(response.data);
                setStats({
                    totalIngenios: response.meta.totalItems,
                    totalUsers: 0 
                });
                setTotalItems(response.meta.totalItems);
            } else {
                // APPEND (Paginación)
                setIngeniosBuffer(prev => {
                    const existingIds = new Set(prev.map(i => i.id));
                    const newItems = response.data.filter(i => !existingIds.has(i.id));
                    return [...prev, ...newItems];
                });
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [apiPage, appliedFilters]); // Dependemos de appliedFilters, no tempFilters

    // --- EFECTOS ---
    
    // 1. Cargar datos cuando cambia apiPage
    // Usamos un ref para evitar doble carga inicial estricta si fuera necesario, 
    // pero aquí está bien que cargue al montar.
    useEffect(() => {
        // Si apiPage es 1, asumimos que puede ser reset o carga inicial
        // Pero loadData(false) es lo estándar aquí, el reset lo maneja el botón
        if (apiPage > 1) {
            loadData(false);
        } else {
            // Carga inicial al montar o al resetear filtros
            loadData(true);
        }
    }, [apiPage, appliedFilters, loadData]); 

    // 2. Detectar fin de búfer
    const startIndex = (uiPage - 1) * UI_LIMIT;
    const endIndex = startIndex + UI_LIMIT;
    const visibleIngenios = ingeniosBuffer.slice(startIndex, endIndex);

    useEffect(() => {
        const shouldFetchMore = 
            endIndex >= ingeniosBuffer.length && 
            ingeniosBuffer.length < totalItems && 
            ingeniosBuffer.length > 0;

        if (shouldFetchMore) {
            setApiPage(prev => prev + 1);
        }
    }, [uiPage, ingeniosBuffer.length, totalItems, endIndex]);

    // --- HANDLERS ---

    const handleApplyFilters = () => {
        // Al filtrar:
        // 1. Actualizamos los filtros aplicados
        setAppliedFilters(tempFilters);
        // 2. Reseteamos paginación
        setApiPage(1);
        setUiPage(1);
        // 3. Limpiamos búfer visualmente (opcional, loadData(true) lo hará)
        setIngeniosBuffer([]); 
        // El useEffect[apiPage, appliedFilters] detectará el cambio y llamará loadData(true)
    };

    const handleInputKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleApplyFilters();
    };

    const goToFirstPage = () => setUiPage(1);

    const totalUiPages = Math.ceil(totalItems / UI_LIMIT);

    return (
        <Container>
            <Header>
                <Title>Panel Global de Superadmin</Title>
                <Subtitle>Visión general del sistema multi-ingenio</Subtitle>
            </Header>

            <StatsGrid>
                <StatCard>
                    <StatLabel>Total Ingenios</StatLabel>
                    <StatValue>{stats.totalIngenios}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Estado del Sistema</StatLabel>
                    <StatValue style={{color: '#16a34a'}}>Operativo</StatValue>
                </StatCard>
            </StatsGrid>

            {/* --- BARRA DE FILTROS --- */}
            <FilterBar>
                <InputGroup>
                    <Label>Búsqueda</Label>
                    <TextInput 
                        placeholder="Nombre, código, ubicación..." 
                        value={tempFilters.search}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                        onKeyDown={handleInputKey}
                    />
                </InputGroup>

                <InputGroup>
                    <Label>Estado</Label>
                    <SelectInput
                        value={tempFilters.active}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, active: e.target.value }))}
                    >
                        <option value="all">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </SelectInput>
                </InputGroup>

                <PrimaryButton onClick={handleApplyFilters}>
                    🔍 Buscar
                </PrimaryButton>
            </FilterBar>

            <IngeniosList>
                <ListHeader>Ingenios Registrados</ListHeader>
                
                {loading && apiPage === 1 ? (
                    <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>
                        Cargando datos...
                    </div>
                ) : visibleIngenios.length === 0 ? (
                    <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>
                        No se encontraron ingenios con los filtros actuales.
                    </div>
                ) : (
                    visibleIngenios.map(ing => (
                        <ListItem key={ing.id}>
                            <div>
                                <div style={{fontWeight: 600, color: '#1e293b'}}>{ing.name}</div>
                                <div style={{fontSize: 13, color: '#64748b'}}>{ing.location || 'Sin ubicación'}</div>
                            </div>
                            <div style={{
                                background: ing.active ? '#f1f5f9' : '#fef2f2', 
                                padding: '4px 8px', 
                                borderRadius: 4, 
                                fontSize: 12, 
                                fontWeight: 600,
                                color: ing.active ? '#475569' : '#dc2626'
                            }}>
                                {ing.active ? 'ACTIVO' : 'INACTIVO'} • {ing.code}
                            </div>
                        </ListItem>
                    ))
                )}

                {/* --- PAGINACIÓN --- */}
                {totalItems > 0 && (
                    <PaginationContainer>
                         {/* Botón Primera Página */}
                        <div>
                            <PaginationButton 
                                disabled={uiPage === 1}
                                onClick={goToFirstPage}
                                title="Ir a la primera página"
                            >
                                ⇤ Primera
                            </PaginationButton>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <PageInfo>
                                Página {uiPage} de {totalUiPages} 
                                <span style={{fontSize: '0.9em', color: '#94a3b8', marginLeft: 8}}>
                                    ({totalItems} regs)
                                </span>
                            </PageInfo>
                            
                            <div style={{marginLeft: 12}}>
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
        </Container>
    );
}