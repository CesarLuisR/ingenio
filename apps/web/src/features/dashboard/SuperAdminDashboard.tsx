import { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import type { Ingenio } from "../../types";

import {
  Container,
  Header,
  Title,
  Subtitle,
  FilterBar,
  InputGroup,
  Label,
  TextInput,
  SelectInput,
  PrimaryButton,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  IngeniosList,
  ListHeader,
  ListItem,
  PaginationContainer,
  PageInfo,
  PaginationButton
} from "./styled";
import { ItemName } from "../ingenios/styled";

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
                    Buscar
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
                                <ItemName>{ing.name}</ItemName>
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