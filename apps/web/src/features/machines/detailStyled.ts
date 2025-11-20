import styled, { css, keyframes } from "styled-components";

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout General ---
export const Container = styled.div`
  padding: 32px 40px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8fafc; /* Slate 50 */
  font-family: 'Inter', sans-serif;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

// --- Grid Principal (Layout de 2 columnas) ---
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px; /* Columna lateral fija un poco más ancha */
  gap: 32px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr; /* Stack en móviles/tablets */
  }
`;

// --- Header ---
export const Header = styled.header`
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

export const SubInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    
    /* Iconos simulados con emojis o svg si tuvieras */
    &::before {
      content: '•'; 
      color: #cbd5e1;
      margin-right: 4px;
    }
    &:first-child::before { display: none; }
  }
`;

// --- Tags ---
export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

export const Tag = styled.span`
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
`;

export const StatusTag = styled.span<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  background: ${({ $active }) => ($active ? "#ecfdf5" : "#fef2f2")};
  color: ${({ $active }) => ($active ? "#059669" : "#b91c1c")};
  border: 1px solid ${({ $active }) => ($active ? "#a7f3d0" : "#fecaca")};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }
`;

// --- Tabs ---
export const TabsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1px; /* Para que el borde activo se solape */
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#2563eb" : "#64748b")};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? "#2563eb" : "transparent")};
    transition: all 0.2s;
  }

  &:hover {
    color: #1e293b;
    background: ${({ $active }) => ($active ? "transparent" : "#f1f5f9")};
    border-radius: 6px 6px 0 0;
  }
`;

// --- Sidebar y Secciones ---
export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 24px; /* Sticky effect */
  height: fit-content;
`;

export const Section = styled.section`
  /* Sin fondo por defecto para que se sienta integrado, usamos cards dentro */
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeIn} 0.4s ease;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #334155;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
`;

// --- Cards de Información (Metrics, Info General) ---
export const SidebarCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  div {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed #f1f5f9;
    padding-bottom: 8px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    span:first-child {
      color: #64748b;
      font-size: 13px;
      font-weight: 500;
    }
    span:last-child {
      color: #0f172a;
      font-size: 14px;
      font-weight: 600;
      text-align: right;
    }
  }
`;

// --- Métricas (Grid mejorado) ---
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const MetricCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transition: transform 0.2s;

  &:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }
`;

export const MetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
`;

export const MetricValue = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
`;

// --- Listas de Historial (Feed Style) ---
export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InfoCard = styled.div<{ $error?: boolean }>`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid ${({ $error }) => ($error ? "#fecaca" : "#e2e8f0")};
  border-left: 4px solid ${({ $error }) => ($error ? "#ef4444" : "#3b82f6")};
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    transform: translateX(4px);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .date {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    background: #f8fafc;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #64748b;
    
    strong { color: #334155; }
  }

  .notes {
    margin-top: 8px;
    padding: 12px;
    background: ${({ $error }) => ($error ? "#fef2f2" : "#f8fafc")};
    border-radius: 8px;
    font-size: 13px;
    color: #475569;
    line-height: 1.5;
    font-style: italic;
  }
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 48px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  color: #94a3b8;
  font-weight: 500;
`;