import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  padding: 2rem 3rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  animation: ${fadeIn} 0.4s ease-out;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const HeaderGroup = styled.div``;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.25rem 0 0 0;
  font-weight: 500;
`;

export const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.primary};
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

export const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

export const TextInput = styled.input`
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
  }
`;

export const SelectInput = styled.select`
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
  }
`;

export const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

export const IngeniosList = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ListHeader = styled.div`
  padding: 18px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.card};
`;

export const ListItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ItemName = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ItemSub = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Badge = styled.div<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? "#e2f3ff" : "#fee2e2")};
  color: ${({ $active }) => ($active ? "#2563eb" : "#b91c1c")};
  font-size: 12px;
  padding: 4px 8px;
  font-weight: 700;
  border-radius: 6px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid
    ${({ theme, $danger }) => ($danger ? "#fca5a5" : theme.colors.border)};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme, $danger }) =>
    $danger ? "#dc2626" : theme.colors.text.primary};
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

export const PageInfo = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

export const PaginationButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
