import styled from "styled-components";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Ingenio } from "../../types";

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

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalIngenios: 0,
        totalUsers: 0, // Placeholder, necesitaríamos un endpoint para esto
    });
    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const ingeniosData = await api.getAllIngenios();
                setIngenios(ingeniosData);
                setStats({
                    totalIngenios: ingeniosData.length,
                    totalUsers: 0 // TODO: Implementar endpoint de conteo global
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <Container>Cargando panel global...</Container>;

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
                {/* Más métricas globales aquí */}
            </StatsGrid>

            <IngeniosList>
                <ListHeader>Ingenios Registrados</ListHeader>
                {ingenios.map(ing => (
                    <ListItem key={ing.id}>
                        <div>
                            <div style={{fontWeight: 600, color: '#1e293b'}}>{ing.name}</div>
                            <div style={{fontSize: 13, color: '#64748b'}}>{ing.location || 'Sin ubicación'}</div>
                        </div>
                        <div style={{
                            background: '#f1f5f9', 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            fontSize: 12, 
                            fontWeight: 600,
                            color: '#475569'
                        }}>
                            {ing.code}
                        </div>
                    </ListItem>
                ))}
            </IngeniosList>
        </Container>
    );
}
