import styled from "styled-components";

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 460px;
  width: 100%;
  padding: 28px;
  animation: fadeIn 0.2s ease-out;
`;

export const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
`;

export const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
    outline: none;
  }
`;

export const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
    outline: none;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 10px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;

  &:hover {
    background: #f3f4f6;
  }
`;

export const SubmitButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;

  &:hover {
    background: #1d4ed8;
  }
`;
