import { useState, useEffect, useCallback } from "react";
import { api } from "../../../lib/api"; // Tu fachada de API
import type { AuditLog } from "../../../types";

interface AuditFilters {
  page: number;
  limit: number;
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const useAuditLogs = (initialFilters: AuditFilters) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Limpiamos filtros vacíos antes de enviar
      const cleanFilters: any = { ...initialFilters };
      Object.keys(cleanFilters).forEach(key => {
        if (!cleanFilters[key]) delete cleanFilters[key];
      });

      const response = await api.auditLogs.getAll(cleanFilters);
      
      setLogs(response.data);
      setPagination(response.meta as any); // Ajuste de tipo según tu respuesta
    } catch (err: any) {
      setError(err.message || "Error cargando auditoría");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(initialFilters)]); // Se recarga si cambian los filtros

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Helpers de paginación
  const nextPage = () => {
    if (pagination.hasNextPage) initialFilters.page++; 
    // Nota: En React real, deberías pasar setFilters desde el padre, 
    // aquí asumo que el padre controla el estado de los filtros.
  };

  return { logs, loading, error, pagination, reload: fetchLogs, nextPage };
};