import styled, { keyframes } from 'styled-components';

// --- Animaciones base ---

const popIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const spin = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
`;

// --- LAYOUT PRINCIPAL DEL MÓDULO ---

export const Container = styled.div`
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

export const Header = styled.div`
  margin-bottom: 8px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.02em;
`;

export const SubTitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 640px;
  line-height: 1.6;
`;

// --- SECCIÓN DE CHAT / ENTRADA ---

export const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  width: 100%;
`;

export const ChatInputContainer = styled.div<{ $loading?: boolean }>`
  width: 100%;
  max-width: 700px;
  position: relative;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  border-radius: 16px;

  box-shadow: ${({ $loading, theme }) =>
    $loading
      ? `0 0 0 4px ${theme.colors.accent.primary}20`
      : '0 4px 20px rgba(15, 23, 42, 0.06)'};

  &:focus-within {
    transform: translateY(-1px);
  }
`;

export const ChatInput = styled.input`
  width: 100%;
  padding: 18px 56px 18px 20px;
  font-size: 15px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 10px 30px -15px rgba(37, 99, 235, 0.4);
    background: ${({ theme }) => theme.colors.background};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const SendButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.accent.primary};
  color: #ffffff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.05);
    background: ${({ theme }) => theme.colors.accent.hover};
    box-shadow: 0 10px 30px -18px rgba(15, 23, 42, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.97);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: default;
    box-shadow: none;
  }

  .spinner {
    animation: ${spin} 0.8s linear infinite;
    stroke: currentColor;
  }
`;

// --- SUGERENCIAS / CHIPS ---

export const SuggestionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 800px;
  animation: ${popIn} 0.5s ease-out;
`;

export const SuggestionChip = styled.button`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.02);

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.accent.primary};
    background: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.04);
  }
`;

export const LoadingThinking = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${popIn} 0.3s ease;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.accent.primary};
    border-radius: 999px;
    animation: ${pulse} 1.4s ease-in-out infinite;
  }
`;

// --- RESPUESTA / TARJETA DEL REPORTE ---

export const ResponseContainer = styled.div`
  width: 100%;
  max-width: 900px;
  animation: ${popIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const AIMessageBubble = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px 22px;
  border-radius: 0 20px 20px 20px;
  display: flex;
  gap: 14px;
  box-shadow: 0 4px 8px -4px rgba(15, 23, 42, 0.05);
  margin-bottom: 20px;

  .avatar {
    font-size: 22px;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #e0e7ff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    font-size: 15px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.primary};
    flex: 1;
  }
`;

export const ReportCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 28px 26px;
  box-shadow: 0 20px 40px -18px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 16px;
  gap: 12px;
`;

export const ReportTitle = styled.h2`
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ReportMeta = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const ErrorBox = styled.div`
  padding: 16px 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 16px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
`;

// --- WIDGETS Y KPI CARDS ---

export const WidgetContainer = styled.div`
  width: 100%;
  height: 400px;
  padding: 10px;
  position: relative;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 12px 30px -18px rgba(15, 23, 42, 0.35);
  overflow: hidden;
`;

export const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 18px;
  width: 100%;
  height: 100%;
  padding: 8px;
  align-items: stretch;
`;

export const KPICard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 20px 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 8px 20px -12px rgba(37, 99, 235, 0.45);
  }

  h4 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  span {
    display: block;
    margin-top: 10px;
    font-size: 30px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.accent.primary};
    line-height: 1;
  }
`;
