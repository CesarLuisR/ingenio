import styled, { css } from "styled-components";

// --- TIPOS ---
interface Activity {
  id: string;
  type: 'failure' | 'maintenance';
  title: string;
  machine: string;
  timestamp: string;
  meta: string; // Severidad o Técnico
}

// --- UTILIDADES ---
// Función simple para formatear hora (puedes usar date-fns si prefieres)
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "Justo ahora";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ActivityFeed({ data }: { data: Activity[] }) {
  if (!data.length) return (
    <EmptyState>
      <div style={{ fontSize: 24, marginBottom: 8 }}>💤</div>
      <span>Sin actividad reciente</span>
    </EmptyState>
  );

  return (
    <FeedContainer>
      {data.map((item) => (
        <FeedItem key={item.id}>
          {/* Columna Icono */}
          <IconWrapper>
            <IconBox $type={item.type}>
              {item.type === 'failure' ? '🚨' : '🛠️'}
            </IconBox>
            <ConnectorLine />
          </IconWrapper>

          {/* Columna Contenido */}
          <Content>
            <HeaderRow>
              <Title $type={item.type}>{item.title}</Title>
              <TimeBadge>{formatTime(item.timestamp)}</TimeBadge>
            </HeaderRow>
            
            <MachineName>{item.machine}</MachineName>
            
            <MetaRow>
              {item.type === 'failure' ? (
                <Badge $variant="danger">Severidad: {item.meta}</Badge>
              ) : (
                <Badge $variant="info">Téc: {item.meta}</Badge>
              )}
            </MetaRow>
          </Content>
        </FeedItem>
      ))}
    </FeedContainer>
  );
}

// --- STYLED COMPONENTS ---

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px; // Espacio para scrollbar

  /* Scrollbar personalizado y elegante */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }
`;

const FeedItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 8px 16px 8px; // Padding bottom extra para el conector
  position: relative;
  transition: background-color 0.2s;
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background };
  }

  /* Ocultar la línea conectora en el último elemento */
  &:last-child > div:first-child > div:last-child {
    display: none;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
  flex-shrink: 0;
`;

const IconBox = styled.div<{ $type: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%; // Círculo perfecto
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  z-index: 2;
  box-shadow: 0 0 0 4px #fff; // "Borde" blanco para separar de la línea
  
  background: ${p => p.$type === 'failure' ? '#fee2e2' : '#e0f2fe'};
  color: ${p => p.$type === 'failure' ? '#dc2626' : '#0284c7'};
  border: 1px solid ${p => p.$type === 'failure' ? '#fca5a5' : '#bae6fd'};
`;

const ConnectorLine = styled.div`
  width: 2px;
  flex: 1;
  background-color: #e2e8f0;
  margin-top: 4px;
  min-height: 20px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 2px; // Alinear visualmente con el icono
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
`;

const Title = styled.span<{ $type: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const MachineName = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 6px;
`;

const TimeBadge = styled.span`
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 8px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Badge = styled.span<{ $variant: 'danger' | 'info' }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.02em;

  ${({ $variant }) => $variant === 'danger' && css`
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  `}

  ${({ $variant }) => $variant === 'info' && css`
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
`;