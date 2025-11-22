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

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

const ActionButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.$danger ? "#fecaca" : "#e2e8f0")};
  background: ${(props) => (props.$danger ? "#fef2f2" : "white")};
  color: ${(props) => (props.$danger ? "#dc2626" : "#475569")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.$danger ? "#fee2e2" : "#f8fafc")};
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
            <Card key={ingenio.id}>
              <CardHeader>
                <IngenioName>{ingenio.name}</IngenioName>
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
                <ActionButton
                  $danger
                  onClick={async () => {
                    if (
                      confirm(
                        `¿Estás seguro de eliminar el ingenio ${ingenio.name}?`
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
