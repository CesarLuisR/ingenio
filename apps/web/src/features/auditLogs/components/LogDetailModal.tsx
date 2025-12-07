import React from "react";
import styled from "styled-components";
import { Modal, ModalContent, ModalTitle, CloseIconButton, BaseButton } from "../../machines/styled"; // Reusa tus estilos
import type { AuditLog } from "../../../types";

const CodeBlock = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 400px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  span:first-child { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
  span:last-child { font-size: 14px; color: #0f172a; font-weight: 500; }
`;

interface Props {
  log: AuditLog | null;
  onClose: () => void;
}

export const LogDetailModal: React.FC<Props> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <CloseIconButton onClick={onClose}>×</CloseIconButton>
        <ModalTitle>Detalle de Auditoría</ModalTitle>

        <FieldGrid>
          <Field>
            <span>Usuario</span>
            <span>{log.user?.email || `ID: ${log.userId}`}</span>
          </Field>
          <Field>
            <span>Acción</span>
            <span>{log.action} - {log.entity}</span>
          </Field>
          <Field>
            <span>Fecha</span>
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </Field>
          <Field>
            <span>IP Origen</span>
            <span>{log.ip}</span>
          </Field>
        </FieldGrid>

        <Field>
          <span>Estado Anterior / Meta Data</span>
          {log.meta ? (
            <CodeBlock>
              {JSON.stringify(log.meta, null, 2)}
            </CodeBlock>
          ) : (
            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin datos adicionales registrados.</p>
          )}
        </Field>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <BaseButton onClick={onClose} style={{ background: '#f1f5f9', color: '#475569' }}>
            Cerrar
          </BaseButton>
        </div>
      </ModalContent>
    </Modal>
  );
};