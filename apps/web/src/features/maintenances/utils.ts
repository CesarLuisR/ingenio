// Normaliza strings para comparaciones y búsquedas
export const normalize = (s: string) =>
	s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

// Busca por nombre exacto (normalizado)
export const findByName = <T extends { name: string }>(
	items: T[],
	target: string | undefined | null,
) => {
	if (!target) return null;
	const t = normalize(String(target));
	return items.find((i) => normalize(i.name) === t) ?? null;
};

export function parseHumanDate(value: any): Date | null {
    if (!value) return null;
    if (typeof value !== "string") return null;

    const clean = value.trim();

    // Caso ISO: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        const d = new Date(clean + "T00:00:00");
        return isNaN(d.getTime()) ? null : d;
    }

    // Caso dd/mm/yyyy o dd-mm-yyyy
    const match = clean.match(
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
    );

    if (match) {
        const [, dd, mm, yyyy, hh, min] = match.map((v) => v || "0");

        const day = parseInt(dd, 10);
        const month = parseInt(mm, 10) - 1; // JS months 0–11
        const year = parseInt(yyyy, 10);
        const hour = parseInt(hh, 10) || 0;
        const minute = parseInt(min, 10) || 0;

        const d = new Date(year, month, day, hour, minute);
        if (isNaN(d.getTime())) return null;

        // Validación de overflow (por ej. 32/13/2025)
        if (
            d.getFullYear() !== year ||
            d.getMonth() !== month ||
            d.getDate() !== day
        ) {
            return null;
        }

        return d;
    }

    // Último fallback — casi nunca debería usarse
    const fallback = new Date(clean);
    return isNaN(fallback.getTime()) ? null : fallback;
}

export const formatMoney = (value?: number | null) => {
	if (value == null) return "";
	return value.toLocaleString("es-DO", {
		style: "currency",
		currency: "DOP",
		maximumFractionDigits: 2,
	});
};

export const safeNumber = (value: string) => {
	const n = Number(value);
	if (Number.isNaN(n)) return undefined;
	return n;
};
