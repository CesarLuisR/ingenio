// types/reports.ts
import { UserRole } from '@prisma/client';

// --- ENUMS DE VISUALIZACIÓN ---
// Le dice al Frontend qué componente renderizar
export type VisualizationType = 
  | 'KPI_CARD'      // Tarjeta simple con un número grande
  | 'LINE_CHART'    // Gráfico de líneas (series de tiempo)
  | 'BAR_CHART'     // Comparativo
  | 'PIE_CHART'     // Distribución
  | 'TABLE'         // Datos crudos
  | 'GAUGE';        // Velocímetro (para OEE)

// --- CONFIGURACIÓN DE UI ---
// Instrucciones para que el frontend sepa qué pintar en los ejes
export interface UIConfig {
  title: string;
  description?: string;
  type: VisualizationType;
  xAxisKey?: string; // Ej: 'timestamp'
  yAxisKeys?: string[]; // Ej: ['availability', 'performance']
  colors?: string[]; // Hex codes opcionales
  units?: string; // Ej: '%', 'kWh'
}

// --- RESPUESTA DEL REPORTE ---
export interface ReportResponse {
  meta: UIConfig;
  data: any[]; // Array de objetos agnóstico
  generatedAt: Date;
}

// --- CONTEXTO DE EJECUCIÓN ---
// Datos necesarios para filtrar por seguridad
export interface ReportContext {
  userId: number;
  userRole: UserRole;
  ingenioId?: number; // Si el usuario está atado a un ingenio
}

// --- PARÁMETROS DE ENTRADA ---
export interface ReportParams {
  startDate?: Date;
  endDate?: Date;
  machineId?: number;
  [key: string]: any; // Filtros extra flexibles
}

// --- DEFINICIÓN DEL REPORTE (REGISTRO) ---
// Esto es lo que "ve" el sistema y la IA para saber qué existe
export interface ReportDefinition {
  id: string; // Clave única, ej: 'GLOBAL_OEE'
  name: string; // Para la IA y humanos
  description: string; // Contexto para la IA
  requiredRoles: UserRole[]; // Security Layer
  // La función generadora real
  generator: (ctx: ReportContext, params: ReportParams) => Promise<ReportResponse>;
}