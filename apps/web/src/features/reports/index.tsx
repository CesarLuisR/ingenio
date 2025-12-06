import { useState } from "react";
import { ExecutiveReportRenderer } from "./components/ExecutiveReportRenderer";

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
  AIMessageBubble,
  LoadingThinking,
  SuggestionsGrid,
  SuggestionChip,
  ErrorBox
} from "./styled";

import type { AIResponse } from "../../types/reports";
import { api } from "../../lib/api";

// Sugerencias rápidas para el usuario
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
    setResponse(null); // Limpia resultados previos

    try {
      if (textOverride) setQuery(textOverride);

      const result = await api.reports.askAssistant(textToSearch);
      setResponse(result);
    } catch (err) {
      console.error(err);
      setResponse({
        type: "ERROR",
        message: "No pude conectar con el asistente inteligente. Intenta nuevamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Asistente Inteligente</Title>
          <SubTitle>
            Pregunta en lenguaje natural sobre el estado de tu planta.  
            La IA seleccionará y generará un informe ejecutivo completo.
          </SubTitle>
        </div>
      </Header>

      <ChatSection>
        {/* INPUT */}
        <ChatInputContainer $loading={loading}>
          <ChatInput
            placeholder={
              loading
                ? "Analizando tu solicitud..."
                : "Ej: ¿Cuál fue la disponibilidad de la línea 1 la semana pasada?"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
          />

          <SendButton
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <svg className="spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </SendButton>
        </ChatInputContainer>

        {/* SUGERENCIAS */}
        {!response && !loading && (
          <SuggestionsGrid>
            {SUGGESTIONS.map((s) => (
              <SuggestionChip key={s} onClick={() => handleSearch(s)}>
                ✨ {s}
              </SuggestionChip>
            ))}
          </SuggestionsGrid>
        )}

        {/* LOADING */}
        {loading && (
          <LoadingThinking>
            <span>Generando informe ejecutivo...</span>
          </LoadingThinking>
        )}

        {/* RESPUESTA */}
        {response && (
          <ResponseContainer>
            {/* ERROR */}
            {response.type === "ERROR" && <ErrorBox>{response.message}</ErrorBox>}

            {/* TEXTO SIMPLE */}
            {response.type === "TEXT" && (
              <AIMessageBubble>
                <div className="avatar">🤖</div>
                <div className="content">{response.message}</div>
              </AIMessageBubble>
            )}

            {/* INFORME EJECUTIVO COMPLETO */}
            {response.type === "WIDGET" && (
              <ReportCard>
                <ExecutiveReportRenderer report={response.payload} />
              </ReportCard>
            )}
          </ResponseContainer>
        )}
      </ChatSection>
    </Container>
  );
}
