import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import RedisRepository from "../repositories/cache/redisRepository";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";
import { ConfigData } from "../../types/sensorTypes";

const cacheRepository = new RedisRepository();

/* ----------------------------------------------------------
   GET /sensors
----------------------------------------------------------- */
export const getAllSensors = async (req: Request, res: Response) => {
	try {
		const sensors = await prisma.sensor.findMany({
			where: { ingenioId: req.session.user?.ingenioId },
			include: {
				failures: true,
				machine: true,      // Ahora que sensor pertenece a machine
			},
		});

		res.json(sensors);
	} catch (error) {
		console.error("Error fetching sensors:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/* ----------------------------------------------------------
   GET /sensors/:sensorId
----------------------------------------------------------- */
export const getSensorById = async (req: Request, res: Response) => {
	try {
		const { sensorId } = req.params;

		const sensor = await prisma.sensor.findUnique({
			where: { sensorId },
			include: {
				failures: true,
				machine: true,
			},
		});

		if (!sensor) {
			return res.status(404).json({ message: "Sensor not found" });
		}

		// 🔒 Multi-ingenio: solo accede si pertenece al mismo ingenio
		if (sensor.ingenioId !== req.session.user?.ingenioId) {
			return res.status(403).json({ message: "Forbidden access" });
		}

		res.json(sensor);
	} catch (error) {
		console.error("Error fetching sensor:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/* ----------------------------------------------------------
   PUT /sensors/:sensorId
----------------------------------------------------------- */
export const updateSensor = async (req: Request, res: Response) => {
	try {
		const { sensorId } = req.params;
		const data = req.body;

		// Primero buscamos el sensor para validar ingenio
		const existing = await prisma.sensor.findUnique({
			where: { sensorId },
		});

		if (!existing) {
			return res.status(404).json({ message: "Sensor not found" });
		}

		if (
			!hasPermission(
				req.session.user?.role as UserRole,
				UserRole.ADMIN,
				{ user: req.session.user?.ingenioId!, element: existing.ingenioId }
			)
		)
			return res.status(403).json({ message: "Forbidden access" });

		// 🔒 Validación multi-ingenio
		if (existing.ingenioId !== req.session.user?.ingenioId) {
			return res.status(403).json({ message: "Forbidden access" });
		}

		const updated = await prisma.sensor.update({
			where: { sensorId },
			data: {
				name: data.name,
				type: data.type,
				location: data.location,
				config: data.config,
				lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
				active: data.active ?? true,
			},
		});

		// Cache configuraciones (si aplica)
		// todo: que tan malo es este codigo?
		if (data.config) {
			cacheRepository.set(
				`sensor:${sensorId}-updated`,
				JSON.stringify(data.config)
			);
		}

		res.json(updated);
	} catch (error: any) {
		console.error("Error updating sensor:", error);

		if (error.code === "P2025") {
			return res.status(404).json({ error: "Sensor not found" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
};

/* ----------------------------------------------------------
   PATCH /sensors/:sensorId/deactivate
----------------------------------------------------------- */
export const deactivateSensor = async (req: Request, res: Response) => {
	try {
		const { sensorId } = req.params;

		// Primero validamos que exista y pertenezca al ingenio
		const existing = await prisma.sensor.findUnique({
			where: { sensorId },
		});

		if (!existing) {
			return res.status(404).json({ error: "Sensor not found" });
		}

		if (
			!hasPermission(
				req.session.user?.role as UserRole,
				UserRole.ADMIN,
				{ user: req.session.user?.ingenioId!, element: existing.ingenioId }
			)
		)
			return res.status(403).json({ message: "Forbidden access" });

		if (existing.ingenioId !== req.session.user?.ingenioId) {
			return res.status(403).json({ message: "Forbidden access" });
		}

		const currentConfig = (existing.config as Record<string, any>) || {};
		currentConfig.active = false;

		await cacheRepository.set(
			`sensor:${sensorId}-updated`,
			JSON.stringify(currentConfig)
		);

		const sensor = await prisma.sensor.update({
			where: { sensorId },
			data: { active: false, config: currentConfig },
		});

		return res.json({
			message: `Sensor ${sensorId} deactivated successfully.`,
			sensor,
		});
	} catch (error: any) {
		console.error("Error deactivating sensor:", error);

		if (error.code === "P2025") {
			return res.status(404).json({ error: "Sensor not found" });
		}

		return res.status(500).json({ error: "Internal server error" });
	}
};

/* ----------------------------------------------------------
   PATCH /sensors/:sensorId/activate
----------------------------------------------------------- */
export const activateSensor = async (req: Request, res: Response) => {
    try {
        const { sensorId } = req.params;

        const existing = await prisma.sensor.findUnique({
            where: { sensorId },
        });

        if (!existing) {
            return res.status(404).json({ error: "Sensor not found" });
        }

        // Validar permisos (misma lógica que deactivate)
        if (existing.ingenioId !== req.session.user?.ingenioId) {
            return res.status(403).json({ message: "Forbidden access" });
        }

		const currentConfig = (existing.config as Record<string, any>) || {};
		currentConfig.active = true;

		// todo
		// codigo de mierda igual que el de arriba, hay que ver como lo arreglamos
		await cacheRepository.set(
			`sensor:${sensorId}-updated`,
			JSON.stringify(currentConfig)
		);	

        const sensor = await prisma.sensor.update({
            where: { sensorId },
            data: { active: true, config: currentConfig },
        });

        return res.json({
            message: `Sensor ${sensorId} activated successfully.`,
            sensor,
        });
    } catch (error: any) {
        console.error("Error activating sensor:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};