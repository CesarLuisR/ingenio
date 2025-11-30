import { useState, useEffect } from "react";
import styled from "styled-components";
import { api } from "../../lib/api";
import { type Ingenio, ROLES } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import IngenioForm from "./components/IngenioForm";

const Container = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const Card = styled.div<{ $inactive?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s;
  opacity: ${(props) => (props.$inactive ? 0.75 : 1)}; /* Visualmente opaco si está inactivo */

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const IngenioName = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #1e293b;
`;

const IngenioCode = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

// Nuevo componente para mostrar el estado
const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4px;
  background-color: ${(props) => (props.$active ? "#dcfce7" : "#f1f5f9")};
  color: ${(props) => (props.$active ? "#15803d" : "#64748b")};
  border: 1px solid ${(props) => (props.$active ? "#bbf7d0" : "#e2e8f0")};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

// Actualizado para soportar variantes de color
const ActionButton = styled.button<{ 
  $danger?: boolean; 
  $success?: boolean; 
  $warning?: boolean 
}>`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  
  /* Lógica de colores */
  border: 1px solid ${(props) => 
    props.$danger ? "#fecaca" : 
    props.$success ? "#bbf7d0" : 
    props.$warning ? "#fed7aa" : 
    "#e2e8f0"};
    
  background: ${(props) => 
    props.$danger ? "#fef2f2" : 
    props.$success ? "#f0fdf4" : 
    props.$warning ? "#fff7ed" : 
    "white"};
    
  color: ${(props) => 
    props.$danger ? "#dc2626" : 
    props.$success ? "#15803d" : 
    props.$warning ? "#c2410c" : 
    "#475569"};

  &:hover {
    background: ${(props) => 
      props.$danger ? "#fee2e2" : 
      props.$success ? "#dcfce7" : 
      props.$warning ? "#ffedd5" : 
      "#f8fafc"};
  }
`;

export default function Ingenios() {
  const [ingenios, setIngenios] = useState<Ingenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingenio | null>(null);
  const { user } = useSessionStore();

  const loadIngenios = async () => {
    try {
      setLoading(true);
      const data = await api.getAllIngenios();
      setIngenios(data);
    } catch (error) {
      console.error("Error loading ingenios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para manejar el toggle
  const handleToggleActive = async (ingenio: Ingenio) => {
    const action = ingenio.active ? "desactivar" : "activar";
    const confirmMessage = ingenio.active 
        ? `¿Seguro que deseas desactivar ${ingenio.name}? Esto detendrá la recolección de datos.` 
        : `¿Deseas reactivar el ingenio ${ingenio.name}?`;

    if (!confirm(confirmMessage)) return;

    try {
        if (ingenio.active) {
            await api.deactivateIngenio(ingenio.id);
        } else {
            await api.activateIngenio(ingenio.id);
        }
        // Recargamos la lista para ver el cambio reflejado
        await loadIngenios();
    } catch (error) {
        console.error(`Error al ${action} ingenio:`, error);
        alert(`Ocurrió un error al intentar ${action} el ingenio.`);
    }
  };

  useEffect(() => {
    loadIngenios();
  }, []);

  if (user?.role !== ROLES.SUPERADMIN) {
    return (
      <Container>
        <Title>Acceso denegado</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Gestión de Ingenios</Title>
          <p style={{ color: "#64748b", margin: "8px 0 0 0" }}>
            Administración global del sistema
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nuevo Ingenio
        </Button>
      </Header>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Grid>
          {ingenios.map((ingenio) => (
            <Card key={ingenio.id} $inactive={!ingenio.active}>
              <CardHeader>
                <div>
                    <IngenioName>{ingenio.name}</IngenioName>
                    {/* Badge visual del estado */}
                    <StatusBadge $active={ingenio.active}>
                        {ingenio.active ? "Activo" : "Inactivo"}
                    </StatusBadge>
                </div>
                <IngenioCode>{ingenio.code}</IngenioCode>
              </CardHeader>

              <InfoRow>
                <span>📍</span>
                {ingenio.location || "Sin ubicación"}
              </InfoRow>
              <InfoRow>
                <span>📅</span>
                Creado el {new Date(ingenio.createdAt).toLocaleDateString()}
              </InfoRow>

              <Actions>
                <ActionButton
                  onClick={() => {
                    setEditing(ingenio);
                    setShowForm(true);
                  }}
                >
                  Editar
                </ActionButton>

                {/* Botón de Activar/Desactivar */}
                <ActionButton
                    $success={!ingenio.active}
                    $warning={ingenio.active}
                    onClick={() => handleToggleActive(ingenio)}
                >
                    {ingenio.active ? "Desactivar" : "Activar"}
                </ActionButton>

                <ActionButton
                  $danger
                  onClick={async () => {
                    if (
                      confirm(
                        `¿Estás seguro de eliminar PERMANENTEMENTE el ingenio ${ingenio.name}?`
                      )
                    ) {
                      try {
                        await api.deleteIngenio(ingenio.id);
                        loadIngenios();
                      } catch (e) {
                        alert("Error al eliminar ingenio");
                      }
                    }
                  }}
                >
                  Eliminar
                </ActionButton>
              </Actions>
            </Card>
          ))}
        </Grid>
      )}

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
            loadIngenios();
          }}
        />
      )}
    </Container>
  );
}