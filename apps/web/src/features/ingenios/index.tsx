import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { type Ingenio, ROLES } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import IngenioForm from "./components/IngenioForm";

// estilos separados
import {
  Container,
  Header,
  Title,
  Button,
  ToggleTheme,
  Grid,
  Card,
  CardHeader,
  IngenioName,
  IngenioCode,
  InfoRow,
  Actions,
  ActionButton,
  Pagination,
  PageButton,
} from "./styled";

export default function Ingenios() {
  const [ingenios, setIngenios] = useState<Ingenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingenio | null>(null);

  const [dark, setDark] = useState(false);

  // paginación
  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);

  const { user } = useSessionStore();

  const loadIngenios = async () => {
    try {
      setLoading(true);
      const data = await api.getAllIngenios();
      setIngenios(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngenios();
  }, []);

  if (user?.role !== ROLES.SUPERADMIN) {
    return (
      <Container $dark={dark}>
        <Title $dark={dark}>Acceso denegado</Title>
      </Container>
    );
  }

  const totalPages = Math.ceil(ingenios.length / ITEMS_PER_PAGE);
  const paginated = ingenios.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Container $dark={dark}>
      <Header>
        <div>
          <Title $dark={dark}>Gestión de Ingenios</Title>
          <p style={{ color: dark ? "#cbd5e1" : "#64748b" }}>
            Administración global del sistema
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <ToggleTheme onClick={() => setDark((d) => !d)}>
            {dark ? "☀️ Claro" : "🌙 Oscuro"}
          </ToggleTheme>

          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Nuevo Ingenio
          </Button>
        </div>
      </Header>

      {loading ? (
        <p style={{ color: dark ? "white" : "black" }}>Cargando...</p>
      ) : (
        <Grid>
          {paginated.map((ingenio) => (
            <Card key={ingenio.id} $dark={dark}>
              <CardHeader>
                <IngenioName $dark={dark}>{ingenio.name}</IngenioName>
                <IngenioCode $dark={dark}>{ingenio.code}</IngenioCode>
              </CardHeader>

              <InfoRow $dark={dark}>
                <span>📍</span>
                {ingenio.location || "Sin ubicación"}
              </InfoRow>

              <InfoRow $dark={dark}>
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
                    if (confirm(`¿Eliminar ${ingenio.name}?`)) {
                      await api.deleteIngenio(ingenio.id);
                      loadIngenios();
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

      {/* --- PAGINACIÓN --- */}
      {totalPages > 1 && (
        <Pagination $dark={dark}>
          <PageButton
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </PageButton>

          {Array.from({ length: totalPages }).map((_, i) => (
            <PageButton
              key={i}
              $active={page === i + 1}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </PageButton>
          ))}

          <PageButton
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </PageButton>
        </Pagination>
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
