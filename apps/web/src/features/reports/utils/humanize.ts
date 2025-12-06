// Mapeo de claves técnicas → etiquetas legibles
export const HUMAN_LABELS: Record<string, string> = {
  id: "Cantidad",
  cost: "Costo (USD)",
  name: "Nombre",
  timestamp: "Fecha",
  oee: "OEE (%)",
  "processMetrics.energy_kwh": "Energía (kWh)",
  machineId: "Máquina",
  ingenioId: "Ingenio",
  severity: "Severidad",
  type: "Tipo",
};

export function humanize(key: string): string {
  if (HUMAN_LABELS[key]) return HUMAN_LABELS[key];

  // Si no está en el mapa, convertir snake_case o camelCase a algo legible
  return key
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
