import { useState, useEffect } from "react";
import styled from "styled-components";
import { api } from "../../../lib/api";
import type { Ingenio } from "../../../types";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #0f172a;
  font-size: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background-color: ${(props) =>
    props.$variant === "primary" ? "#3b82f6" : "#e2e8f0"};
  color: ${(props) => (props.$variant === "primary" ? "white" : "#475569")};

  &:hover {
    opacity: 0.9;
  }
`;

interface Props {
  initialData?: Ingenio | null;
  onClose: () => void;
  onSave: () => void;
}

export default function IngenioForm({ initialData, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        location: initialData.location || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await api.updateIngenio(initialData.id, formData);
      } else {
        await api.createIngenio(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving ingenio:", error);
      alert("Error al guardar el ingenio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{initialData ? "Editar Ingenio" : "Nuevo Ingenio"}</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nombre</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Ingenio La Esperanza"
            />
          </FormGroup>

          <FormGroup>
            <Label>Código</Label>
            <Input
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Ej: ING-001"
            />
          </FormGroup>

          <FormGroup>
            <Label>Ubicación</Label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Ej: Santa Cruz, Bolivia"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContainer>
    </Overlay>
  );
}
