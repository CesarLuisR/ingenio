import styled from "styled-components";

export const Container = styled.div<{ $dark: boolean }>`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${(p) => (p.$dark ? "#0f172a" : "white")};
  min-height: 100vh;
  transition: 0.25s;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

export const Title = styled.h1<{ $dark: boolean }>`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: ${(p) => (p.$dark ? "#f8fafc" : "#0f172a")};
`;

export const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

export const ToggleTheme = styled.button`
  background: transparent;
  color: #3b82f6;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  margin-right: 16px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

export const Card = styled.div<{ $dark: boolean }>`
  background: ${(p) => (p.$dark ? "#1e293b" : "white")};
  border-radius: 12px;
  padding: 24px;
  border: 1px solid ${(p) => (p.$dark ? "#334155" : "#e2e8f0")};
  transition: 0.25s;
  box-shadow: ${(p) =>
    p.$dark ? "none" : "0 1px 3px rgba(0,0,0,0.1)"};

  &:hover {
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const IngenioName = styled.h3<{ $dark: boolean }>`
  font-size: 18px;
  margin: 0;
  color: ${(p) => (p.$dark ? "#f1f5f9" : "#1e293b")};
`;

export const IngenioCode = styled.span<{ $dark: boolean }>`
  background: ${(p) => (p.$dark ? "#334155" : "#f1f5f9")};
  color: ${(p) => (p.$dark ? "#cbd5e1" : "#64748b")};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export const InfoRow = styled.div<{ $dark: boolean }>`
  color: ${(p) => (p.$dark ? "#cbd5e1" : "#64748b")};
  font-size: 14px;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  margin-top: 20px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid ${(p) => (p.$danger ? "#fecaca" : "#e2e8f0")};
  background: ${(p) => (p.$danger ? "#fef2f2" : "white")};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: ${(p) => (p.$danger ? "#fee2e2" : "#f8fafc")};
  }
`;

export const Pagination = styled.div<{ $dark: boolean }>`
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  color: ${(p) => (p.$dark ? "#e2e8f0" : "#475569")};
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#3b82f6" : "white")};
  color: ${(p) => (p.$active ? "white" : "#475569")};

  &:hover {
    background: ${(p) => (p.$active ? "#2563eb" : "#f1f5f9")};
  }
`;
