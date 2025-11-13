import type React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { api } from "../lib/api";
import type { Technician } from "../types";

// === ESTILOS ===
const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin: 0;
`;

const Button = styled.button`
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  &:hover {
    background-color: #1d4ed8;
  }
`;

const TechnicianList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TechnicianCard = styled.div<{ active: boolean }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-left: 4px solid ${(props) => (props.active ? "#10b981" : "#9ca3af")};
  transition: all 0.2s;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Name = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) => (props.active ? "#dcfce7" : "#f3f4f6")};
  color: ${(props) => (props.active ? "#15803d" : "#374151")};
`;

const InfoList = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 4px;
  p {
    margin: 0;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 448px;
  width: 100%;
  padding: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #111827;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 16px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: #1d4ed8;
  }
`;

// === COMPONENTE PRINCIPAL ===
export default function Technicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const techData = await api.getTechnicians();
      setTechnicians(techData);
    } catch (error) {
      console.error("Error cargando técnicos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingText>Cargando técnicos...</LoadingText>;

  return (
    <Container>
      <Header>
        <Title>Técnicos</Title>
        <Button onClick={() => setShowForm(true)}>+ Nuevo Técnico</Button>
      </Header>

      <TechnicianList>
        {technicians.map((t) => (
          <TechnicianCard key={t.id} active={t.active}>
            <CardHeader>
              <Name>{t.name}</Name>
              <StatusBadge active={t.active}>
                {t.active ? "Activo" : "Inactivo"}
              </StatusBadge>
            </CardHeader>

            <InfoList>
              {t.email && <p>📧 {t.email}</p>}
              {t.phone && <p>📞 {t.phone}</p>}
              <p>🧰 Mantenimientos asignados: {t.maintenances?.length || 0}</p>
            </InfoList>
          </TechnicianCard>
        ))}
      </TechnicianList>

      {showForm && (
        <TechnicianForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            loadData();
            setShowForm(false);
          }}
        />
      )}
    </Container>
  );
}

// === FORMULARIO MODAL ===
function TechnicianForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTechnician({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        active: formData.active,
      });
      onSave();
    } catch (error) {
      console.error("Error creando técnico:", error);
    }
  };

  return (
    <Modal>
      <ModalContent>
        <ModalTitle>Registrar Técnico</ModalTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nombre</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </FormGroup>

          <FormGroup>
            <Label>Teléfono</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit">Guardar</SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
}
