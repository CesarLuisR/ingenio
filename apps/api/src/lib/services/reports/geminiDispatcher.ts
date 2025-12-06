// services/ai/geminiDispatcher.ts
import { GoogleGenAI } from "@google/genai";
import { REPORT_REGISTRY } from "./reportRegistry";

// 1. Inicializar con la nueva sintaxis
// El SDK nuevo recibe la apiKey dentro del objeto de opciones
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Generamos la lista de herramientas disponibles dinámicamente
const toolsList = Object.values(REPORT_REGISTRY).map(r => 
  `- ID: "${r.id}" | Descripción: ${r.description}`
).join('\n');

export async function decideReportWithGemini(userQuery: string) {
  
  // PROMPT DE SEGURIDAD (FEW-SHOT PROMPTING)
  const systemPrompt = `
    Eres un orquestador de datos para un sistema industrial. Tu ÚNICO trabajo es seleccionar el reporte correcto basado en la pregunta del usuario.
    
    TUS HERRAMIENTAS (REPORTES DISPONIBLES):
    ${toolsList}

    REGLAS ESTRICTAS:
    1. Responde SOLAMENTE con un objeto JSON válido.
    2. El JSON debe tener la estructura: { "reportId": string | null, "params": object }.
    3. Si la pregunta no se relaciona con ningún reporte disponible, "reportId" debe ser null.
    4. Extrae fechas si el usuario las menciona (ej: "semana pasada", "hoy") en formato ISO 8601 en "params".
    
    EJEMPLOS (APRENDE DE ESTO):
    Input: "¿Cómo están las máquinas ahora mismo?"
    Output: { "reportId": "MACHINE_STATUS_SUMMARY", "params": {} }

    Input: "Muéstrame el pareto de fallas desde el 1 de octubre"
    Output: { "reportId": "TOP_FAILURES", "params": { "startDate": "2023-10-01T00:00:00.000Z" } }

    Input: "Hola, ¿quién eres?"
    Output: { "reportId": null, "params": {} }
  `;

  try {
    // 2. Nueva estructura de llamada generateContent
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      // Concatenamos el System Prompt con el User Query para asegurar contexto
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Input User Query: "${userQuery}"` }
          ]
        }
      ],
      // 3. Configuración para forzar JSON (JSON Mode)
      // Esto hace que el modelo sea mucho más obediente con el formato
      config: {
        responseMimeType: "application/json", 
        temperature: 0, // Determinista: queremos siempre la misma respuesta para la misma query
      }
    });
    
    // 4. Acceso directo a la propiedad .text (ya no es una función)
    const responseText = response.text;

    if (!responseText) {
        return { reportId: null, params: {} };
    }
    
    // Al usar responseMimeType: "application/json", Gemini ya no devuelve los backticks (```json).
    // Podemos parsear directamente.
    return JSON.parse(responseText);

  } catch (error) {
    console.error("Error interpretando con Gemini:", error);
    // Fallback seguro
    return { reportId: null, params: {} };
  }
}