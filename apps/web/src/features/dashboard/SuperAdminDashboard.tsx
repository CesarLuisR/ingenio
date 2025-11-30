import styled from "styled-components";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import type { Ingenio } from "../../types";

// --- ESTILOS EXISTENTES ---
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
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

// --- NUEVOS ESTILOS PARA PAGINACIÓN ---
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  gap: 12px;
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
    const API_LIMIT = 50; // Traemos 50 registros de golpe
    const UI_LIMIT = 10;  // Mostramos solo 10 al usuario

    // --- ESTADOS ---
    const [stats, setStats] = useState({ totalIngenios: 0, totalUsers: 0 });
    
    // Búfer: Almacena todos los registros cargados hasta el momento
    const [ingeniosBuffer, setIngeniosBuffer] = useState<Ingenio[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    // Contadores de página
    const [apiPage, setApiPage] = useState(1); // Página del servidor
    const [uiPage, setUiPage] = useState(1);   // Página visual del usuario

    // --- 1. FUNCIÓN DE CARGA (Con lógica de append/acumulación) ---
    const loadData = useCallback(async () => {
        try {
            // Si es la primera página, mostramos loading global. Si no, es carga background.
            if (apiPage === 1) setLoading(true);

            const response = await api.getAllIngenios({
                page: apiPage,
                limit: API_LIMIT
            });

            // Actualizamos métricas globales con la primera carga
            if (apiPage === 1) {
                setStats({
                    totalIngenios: response.meta.totalItems,
                    totalUsers: 0 
                });
                setTotalItems(response.meta.totalItems);
            }

            // LÓGICA DE BÚFER: Añadimos los nuevos registros sin borrar los viejos
            setIngeniosBuffer(prev => {
                const existingIds = new Set(prev.map(i => i.id));
                const newItems = response.data.filter(i => !existingIds.has(i.id));
                return [...prev, ...newItems];
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [apiPage]);

    // --- 2. EFECTO: Cargar datos cuando cambia la página de la API ---
    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- 3. CÁLCULO VISUAL (Slice) ---
    const startIndex = (uiPage - 1) * UI_LIMIT;
    const endIndex = startIndex + UI_LIMIT;
    const visibleIngenios = ingeniosBuffer.slice(startIndex, endIndex);

    // --- 4. EFECTO: Detector de "Fin de Búfer" (Fetch More Trigger) ---
    useEffect(() => {
        // Si el usuario está viendo los últimos registros del búfer actual...
        const shouldFetchMore = 
            endIndex >= ingeniosBuffer.length && // Llegamos al final de lo local
            ingeniosBuffer.length < totalItems && // Aún quedan datos en el servidor
            ingeniosBuffer.length > 0; // Ya hubo una carga inicial

        if (shouldFetchMore) {
            // ...pedimos el siguiente bloque de 50 a la API
            setApiPage(prev => prev + 1);
        }
    }, [uiPage, ingeniosBuffer.length, totalItems, endIndex]);

    // --- RENDER ---

    const totalUiPages = Math.ceil(totalItems / UI_LIMIT);

    // Loading inicial
    if (loading && apiPage === 1) return <Container>Cargando panel global...</Container>;

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

            <IngeniosList>
                <ListHeader>Ingenios Registrados</ListHeader>
                
                {visibleIngenios.map(ing => (
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
                            {ing.code}
                        </div>
                    </ListItem>
                ))}

                {/* --- CONTROLES DE PAGINACIÓN --- */}
                <PaginationContainer>
                    <PageInfo>
                        Página {uiPage} de {totalUiPages || 1} 
                        <span style={{fontSize: '0.9em', color: '#94a3b8', marginLeft: 8}}>
                             ({totalItems} registros)
                        </span>
                    </PageInfo>
                    
                    <div style={{display: 'flex', gap: 8}}>
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
                </PaginationContainer>
            </IngeniosList>
        </Container>
    );
}