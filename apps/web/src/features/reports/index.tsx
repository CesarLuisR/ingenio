import { useState } from "react";
import { SmartWidget } from "./components/SmartWidget";

import {
  Container,
  Header,
  Title,
  SubTitle,
  ChatSection,
  ChatInputContainer,
  ChatInput,
  SendButton,
  ResponseContainer,
  ReportCard,
  CardHeader,
  ReportTitle,
  ReportMeta,
  AIMessageBubble,
  LoadingThinking,
  SuggestionsGrid,
  SuggestionChip,
  ErrorBox
} from "./styled";
import type { AIResponse } from "../../types/reports";
import { api } from "../../lib/api";

const SUGGESTIONS = [
  "¿Cuántas máquinas están operativas?",
  "Tendencia de OEE últimos 7 días",
  "Top 5 fallas más comunes",
  "Resumen de producción de ayer"
];

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  
  const handleSearch = async (textOverride?: string) => {
    const textToSearch = textOverride || query;
    if (!textToSearch.trim()) return;

    setLoading(true);
    setResponse(null); // Limpiar anterior
    
    try {
      // Si usaste textOverride (clic en sugerencia), actualiza el input visualmente
      if (textOverride) setQuery(textOverride);

      const result = await api.reports.askAssistant(textToSearch);
      setResponse(result);
    } catch (err) {
      console.error(err);
      setResponse({ 
          type: 'ERROR', 
          message: 'No pude conectar con el asistente inteligente. Intenta nuevamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Asistente Inteligente</Title>
          <SubTitle>
            Pregunta en lenguaje natural sobre el estado de tu planta. 
            La IA seleccionará y generará el reporte más adecuado.
          </SubTitle>
        </div>
      </Header>

      <ChatSection>
        {/* ÁREA DE INPUT CENTRADA */}
        <ChatInputContainer $loading={loading}>
          <ChatInput
            placeholder={loading ? "Analizando tu solicitud..." : "Ej: ¿Cuál fue la disponibilidad de la línea 1 la semana pasada?"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
          />
          <SendButton onClick={() => handleSearch()} disabled={loading || !query.trim()}>
            {loading ? (
                // Icono simple de carga
                <svg className="spinner" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle></svg>
            ) : (
                // Icono de flecha/enviar
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            )}
          </SendButton>
        </ChatInputContainer>

        {/* SUGERENCIAS (Solo si no hay respuesta ni carga) */}
        {!response && !loading && (
          <SuggestionsGrid>
            {SUGGESTIONS.map((s) => (
              <SuggestionChip key={s} onClick={() => handleSearch(s)}>
                ✨ {s}
              </SuggestionChip>
            ))}
          </SuggestionsGrid>
        )}

        {/* LOADING STATE ANIMADO */}
        {loading && (
            <LoadingThinking>
                <span>Generando reporte con IA...</span>
            </LoadingThinking>
        )}

        {/* ÁREA DE RESPUESTA */}
        {response && (
          <ResponseContainer>
            
            {/* CASO 1: ERROR */}
            {response.type === 'ERROR' && (
              <ErrorBox>{response.message}</ErrorBox>
            )}

            {/* CASO 2: SOLO TEXTO (Conversación) */}
            {response.type === 'TEXT' && (
              <AIMessageBubble>
                <div className="avatar">🤖</div>
                <div className="content">{response.message}</div>
              </AIMessageBubble>
            )}

            {/* CASO 3: REPORTE VISUAL (WIDGET) */}
            {response.type === 'WIDGET' && (
              <ReportCard>
                <CardHeader>
                  <div>
                    <ReportTitle>{response.payload.meta.title}</ReportTitle>
                    <ReportMeta>
                        {response.payload.meta.description} • 
                        Generado: {new Date(response.payload.generatedAt).toLocaleTimeString()}
                    </ReportMeta>
                  </div>
                  {/* Etiqueta del tipo de gráfico */}
                  <div style={{ fontSize: 11, background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>
                    {response.payload.meta.type}
                  </div>
                </CardHeader>
                
                {/* RENDERIZADO DINÁMICO */}
                <SmartWidget report={response.payload} />
                
              </ReportCard>
            )}
          </ResponseContainer>
        )}
      </ChatSection>
    </Container>
  );
}