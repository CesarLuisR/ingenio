import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: 'Inter', sans-serif;
  background-color: ${({ theme }) => theme.colors.background};
`;

// --- SECCIÓN IZQUIERDA (HERO) ---
export const HeroSection = styled.div`
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
    flex: 1;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px;
    color: white;
    overflow: hidden;

    /* Patrón de fondo sutil */
    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(#334155 1px, transparent 1px);
      background-size: 32px 32px;
      opacity: 0.3;
    }
  }
`;

export const Brand = styled.div`
  position: relative;
  font-size: 24px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 480px;

  h1 {
    font-size: 48px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -0.03em;
  }

  p {
    font-size: 18px;
    color: #94a3b8;
    line-height: 1.6;
  }
`;

// --- SECCIÓN DERECHA (FORMULARIO) ---
export const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: ${({ theme }) => theme.colors.card};
  animation: ${fadeIn} 0.6s ease-out;
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

export const FormHeader = styled.div`
  margin-bottom: 40px;
  
  h2 {
    font-size: 28px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 15px;
  }
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background-color: ${({ theme }) => theme.colors.card};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.1)'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const ErrorMsg = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #b91c1c;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '⚠️';
  }
`;

export const FooterText = styled.p`
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  a {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;