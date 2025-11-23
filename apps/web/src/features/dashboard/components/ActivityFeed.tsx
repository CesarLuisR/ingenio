import styled from "styled-components";

const FeedContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
    max-height: 300px;
    overflow-y: auto;
`;

const FeedItem = styled.div`
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
    align-items: flex-start;

    &:last-child { border-bottom: none; }
`;

const IconBox = styled.div<{ $type: string }>`
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; alignItems: center; justifyContent: center;
    font-size: 16px;
    flex-shrink: 0;
    background: ${p => p.$type === 'failure' ? '#fef2f2' : '#f0f9ff'};
    color: ${p => p.$type === 'failure' ? '#dc2626' : '#0284c7'};
`;

const Content = styled.div`
    flex: 1;
    display: flex; flex-direction: column; gap: 2px;
`;

const Title = styled.span`
    font-size: 14px; font-weight: 600; color: #1e293b;
`;

const Meta = styled.span`
    font-size: 12px; color: #64748b;
`;

const Time = styled.span`
    font-size: 11px; color: #94a3b8; white-space: nowrap;
`;

interface Activity {
    id: string;
    type: 'failure' | 'maintenance';
    title: string;
    machine: string;
    timestamp: string;
    meta: string; // Severidad o Técnico
}

export default function ActivityFeed({ data }: { data: Activity[] }) {
    if (!data.length) return <div style={{padding: 20, textAlign: 'center', color: '#94a3b8'}}>Sin actividad reciente</div>;

    return (
        <FeedContainer>
            {data.map((item) => (
                <FeedItem key={item.id}>
                    <IconBox $type={item.type}>
                        {item.type === 'failure' ? '🚨' : '🔧'}
                    </IconBox>
                    <Content>
                        <Title>{item.title}</Title>
                        <Meta>{item.machine} • {item.meta}</Meta>
                    </Content>
                    <Time>
                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Time>
                </FeedItem>
            ))}
        </FeedContainer>
    );
}