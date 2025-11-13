export const normalize = (s: string) =>
	s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

export const findByName = <T extends { name: string }>(
	items: T[],
	target: string | undefined | null,
) => {
	if (!target) return null;
	const t = normalize(String(target));
	return items.find((i) => normalize(i.name) === t) ?? null;
};

export const parseHumanDate = (raw: string | undefined | null): Date | null => {
	if (!raw) return null;
	const [datePart, hourPart] = String(raw).split(" ");
	const [d, m, y] = datePart.split("/").map(Number);
	if (!d || !m || !y) return null;

	if (!hourPart) return new Date(y, m - 1, d);

	const [hh, mm] = hourPart.split(":").map(Number);
	return new Date(y, m - 1, d, hh ?? 0, mm ?? 0);
};

// === utilidades ===
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