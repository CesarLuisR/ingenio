import styled, { css } from "styled-components";

export const Container = styled.div`
  padding: 0;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  color: #111827;
`;

export const Button = styled.button`
  padding: 10px 16px;
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

export const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const LoadingText = styled.div`
  padding: 48px 0;
  text-align: center;
  color: #6b7280;
`;

export const UserName = styled.div`
  font-weight: 500;
  color: #111827;
`;

export const RoleBadge = styled.span<{ role: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  background-color: ${({ role }) =>
    role === "admin"
      ? "#f3e8ff"
      : role === "technician"
      ? "#dbeafe"
      : "#f3f4f6"};

  color: ${({ role }) =>
    role === "admin"
      ? "#6b21a8"
      : role === "technician"
      ? "#1e40af"
      : "#374151"};
`;
export const Actions = styled.div`
  display: flex;
  gap: 10px;
`;


export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;

  ${({ $danger }) =>
    $danger
      ? css`
          background: #fee2e2;
          color: #b91c1c;
          &:hover { background: #fecaca; }
        `
      : css`
          background: #e0e7ff;
          color: #3730a3;
          &:hover { background: #c7d2fe; }
        `}
`;
