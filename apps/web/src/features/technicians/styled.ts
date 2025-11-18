import styled, { css } from "styled-components";

// =============================
// CONTENEDOR Y LAYOUT
// =============================
export const Container = styled.div`
  padding: 0;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.5px;
`;

// =============================
// BOTÓN PRINCIPAL
// =============================
export const Button = styled.button`
  padding: 10px 18px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.15s;

  &:hover {
    background-color: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.97);
  }
`;

// =============================
// FILTROS
// =============================
export const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

export const SelectInput = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: #ffffff;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.25);
  }
`;

export const TextInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.25);
  }
`;

// =============================
// LISTA DE TARJETAS
// =============================
export const TechnicianList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

// =============================
// TARJETA DE TÉCNICO
// =============================
export const TechnicianCard = styled.div<{ $active: boolean }>`
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  border-left: 6px solid ${({ $active }) => ($active ? "#10b981" : "#9ca3af")};

  transition: all 0.25s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }
`;

// =============================
// CABECERA DE TARJETA
// =============================
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Name = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;

  background-color: ${({ $active }) =>
    $active ? "#dcfce7" : "#f3f4f6"};
  color: ${({ $active }) =>
    $active ? "#15803d" : "#374151"};
`;

// =============================
// INFORMACIÓN DE TARJETA
// =============================
export const InfoList = styled.div`
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #4b5563;

  p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

// =============================
// BOTONES DE ACCIÓN
// =============================
export const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;

  ${({ $danger }) =>
    $danger
      ? css`
          background: #fee2e2;
          color: #b91c1c;

          &:hover {
            background: #fecaca;
          }
        `
      : css`
          background: #e0e7ff;
          color: #3730a3;

          &:hover {
            background: #c7d2fe;
          }
        `}
  
  transition: background-color 0.2s, transform 0.15s;

  &:active {
    transform: scale(0.96);
  }
`;

// =============================
// TEXTO DE CARGA
// =============================
export const LoadingText = styled.div`
  text-align: center;
  padding: 60px 0;
  font-size: 15px;
  color: #6b7280;
`;

// =============================
// MODAL
// =============================
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15,23,42,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
  backdrop-filter: blur(2px);
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  padding: 28px;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.25);
  position: relative;
  animation: fadeIn 0.18s ease-out;

  @keyframes fadeIn {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #1f2937;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    background: #f3f4f6;
  }
`;

// =============================
// FORMULARIO
// =============================
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.25);
    background: white;
  }
`;

export const Select = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.25);
    background: white;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

export const CancelButton = styled.button`
  flex: 1;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #f3f4f6;
  }
`;

export const SubmitButton = styled.button`
  flex: 1;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #1d4ed8;
  }
`;
