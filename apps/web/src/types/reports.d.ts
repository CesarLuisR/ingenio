// src/types/reports.ts

// Tipos de visualización soportados por tu sistema de UI
export type VisualizationType = 
  | 'KPI_CARD' 
  | 'LINE_CHART' 
  | 'BAR_CHART' 
  | 'PIE_CHART' 
  | 'TABLE' 
  | 'GAUGE';

// Configuración de UI (Metadata)
export interface UIConfig {
  title: string;
  description?: string;
  type: VisualizationType;
  xAxisKey?: string;
  yAxisKeys?: string[];
  colors?: string[];
  units?: string;
}

// Payload de datos del reporte
export interface ReportData {
  meta: UIConfig;
  data: any[]; // Array de objetos genéricos
  generatedAt: string; // ISO Date string
}

// Respuesta unificada del Controlador AI
export type AIResponse = 
  | { 
      type: 'WIDGET'; 
      payload: ReportData; 
      debug?: { aiParams: any; reportId: string };
    }
  | { 
      type: 'TEXT'; 
      message: string; 
    }
  | { 
      type: 'ERROR'; 
      message: string; 
    };