import { RequestHandler } from "express-serve-static-core";
import prisma from "../../database/postgres.db";

const msPerHour = 36e5;
const diffHours = (a: Date, b: Date) => (b.getTime() - a.getTime()) / msPerHour;

export const getSensorMetrics: RequestHandler = async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!id) throw new Error("Bad request");

		// SENSOR BASE
		const sensor = await prisma.sensor.findUnique({
			where: { id },
		});

		if (!sensor) {
			return res.status(404).json({ error: "Sensor no encontrado" });
		}

		// TODAS LAS FALLAS DEL SENSOR
		const failures = await prisma.failure.findMany({
			where: { sensorId: id },
			orderBy: { occurredAt: "asc" },
			include: { maintenance: true },
		});

		// Si nunca falló → 100% disponibilidad
		if (failures.length === 0) {
			return res.json({
				availability: 100,
				reliability: 100,
				mtbf: null,
				mttr: null,
				mtta: null,
			});
		}

		// --- MTTR (Mean Time To Repair) ---
		const resolved = failures.filter((f) => f.resolvedAt);
		const mttr =
			resolved.length > 0
				? resolved.reduce((acc, f) => acc + diffHours(f.occurredAt, f.resolvedAt!), 0) /
				  resolved.length
				: null;

		// --- MTTA (Mean Time To Attend) ---
		const attended = failures.filter(
			(f) => f.maintenance && f.maintenance.performedAt
		);

		const mtta =
			attended.length > 0
				? attended.reduce(
						(acc, f) =>
							acc +
							diffHours(
								f.occurredAt,
								f.maintenance!.performedAt!
							),
						0
				  ) / attended.length
				: null;

		// --- MTBF (Mean Time Between Failures) ---
		let mtbf = null;
		if (failures.length > 1) {
			const gaps: number[] = [];
			for (let i = 1; i < failures.length; i++) {
				gaps.push(diffHours(failures[i - 1].occurredAt, failures[i].occurredAt));
			}
			mtbf = gaps.reduce((a, b) => a + b, 0) / gaps.length;
		}

		// ------------------------------------------------------------------
		// 🔥 DISPONIBILIDAD (refactor real-line industrial)
		// ------------------------------------------------------------------

		const now = new Date();
		const start = sensor.createdAt;
		const totalHours = diffHours(start, now);

		// Downtime = suma de intervalos de falla abiertos o cerrados
		let downtime = 0;

		for (const f of failures) {
			const end = f.resolvedAt ?? now; // si no está reparada → sigue fallada
			downtime += diffHours(f.occurredAt, end);
		}

		const uptime = totalHours - downtime;

		const availability =
			totalHours > 0 ? (uptime / totalHours) * 100 : null;

		// ------------------------------------------------------------------
		// 🔥 Confiabilidad (R = MTBF / (MTBF + MTTR))
		// ------------------------------------------------------------------

		const reliability =
			mtbf && mttr ? (mtbf / (mtbf + mttr)) * 100 : null;

		return res.json({
			availability,
			reliability,
			mtbf,
			mttr,
			mtta,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Error calculando métricas del sensor" });
	}
};


export const getIngenioMetrics: RequestHandler = async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!id) throw new Error("Bad request");

		// INFO DEL INGENIO
		const ingenio = await prisma.ingenio.findUnique({
			where: { id },
		});

		if (!ingenio) {
			return res.status(404).json({ error: "Ingenio no encontrado" });
		}

		// FALLAS DE TODOS LOS SENSORES DEL INGENIO
		const failures = await prisma.failure.findMany({
			where: { ingenioId: id },
			orderBy: { occurredAt: "asc" },
			include: { maintenance: true },
		});

		// Sin fallas → 100% en todo
		if (failures.length === 0) {
			return res.json({
				availability: 100,
				reliability: 100,
				mtbf: null,
				mttr: null,
				mtta: null,
			});
		}

		// -----------------------------------------------------
		// MTTR (Mean Time To Repair)
		// -----------------------------------------------------
		const resolved = failures.filter((f) => f.resolvedAt);
		const mttr =
			resolved.length > 0
				? resolved.reduce((acc, f) => acc + diffHours(f.occurredAt, f.resolvedAt!), 0) /
				  resolved.length
				: null;

		// -----------------------------------------------------
		// MTTA (Mean Time To Attend)
		// -----------------------------------------------------
		const attended = failures.filter(
			(f) => f.maintenance && f.maintenance.performedAt
		);

		const mtta =
			attended.length > 0
				? attended.reduce(
						(acc, f) =>
							acc +
							diffHours(
								f.occurredAt,
								f.maintenance!.performedAt!
							),
						0
				  ) /
				  attended.length
				: null;

		// -----------------------------------------------------
		// MTBF (Mean Time Between Failures)
		// -----------------------------------------------------
		let mtbf = null;
		if (failures.length > 1) {
			const gaps: number[] = [];
			for (let i = 1; i < failures.length; i++) {
				gaps.push(diffHours(failures[i - 1].occurredAt, failures[i].occurredAt));
			}
			mtbf = gaps.reduce((a, b) => a + b, 0) / gaps.length;
		}

		// -----------------------------------------------------
		// DISPONIBILIDAD REAL (Industrial)
		// -----------------------------------------------------
		const now = new Date();
		const start = ingenio.createdAt;
		const totalHours = diffHours(start, now);

		let downtime = 0;

		for (const f of failures) {
			const end = f.resolvedAt ?? now;
			downtime += diffHours(f.occurredAt, end);
		}

		const uptime = totalHours - downtime;

		const availability =
			totalHours > 0 ? (uptime / totalHours) * 100 : null;

		// -----------------------------------------------------
		// Confiabilidad del ingenio
		// -----------------------------------------------------
		const reliability =
			mtbf && mttr ? (mtbf / (mtbf + mttr)) * 100 : null;

		return res.json({
			availability,
			reliability,
			mtbf,
			mttr,
			mtta,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Error calculando métricas del ingenio" });
	}
};