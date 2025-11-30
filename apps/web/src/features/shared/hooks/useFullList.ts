import { useState, useEffect } from "react";

// Tipo para la función que trae datos (debe devolver una Promesa)
type FetcherFunction = (params?: any) => Promise<any>;

export function useFullList<T>(
    fetcher: FetcherFunction,
    dependencies: any[] = [],
    enabled: boolean = true
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const load = async () => {
            setLoading(true);
            try {
                // Llamamos a la API. 
                // Nota: Los parámetros como { simple: true } se pasan desde fuera al definir el fetcher.
                const response = await fetcher();

                if (isMounted) {
                    // Soportamos si la API devuelve { data: [...] } o directamente [...]
                    const result = Array.isArray(response) ? response : (response.data || []);
                    setData(result);
                }
            } catch (err: any) {
                console.error("Error useFullList:", err);
                if (isMounted) setError(err.message || "Error desconocido");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, enabled]);

    return { data, loading, error };
}