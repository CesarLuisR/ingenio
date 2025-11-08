import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import RedisRepository from "../repositories/cache/redisRepository";

const cacheRepository = new RedisRepository();
// GET /sensors
export const getAllSensors = async (req: Request, res: Response) => {
	try {
		const sensors = await prisma.sensor.findMany({
			include: { maintenances: true, failures: true },
		});
		res.json(sensors);
	} catch (error) {
		console.error("Error fetching sensors:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// GET /sensors/:sensorId
export const getSensorById = async (req: Request, res: Response) => {
	try {
		const { sensorId } = req.params;

		const sensor = await prisma.sensor.findUnique({
			where: { sensorId },
			include: { maintenances: true, failures: true },
		});

		if (!sensor) {
			return res.status(404).json({ message: "Sensor not found" });
		}

		res.json(sensor);
	} catch (error) {
		console.error("Error fetching sensor:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// PUT /sensors/:sensorId
export const updateSensor = async (req: Request, res: Response) => {
	try {
		const { sensorId } = req.params;
		const data = req.body;

		const sensor = await prisma.sensor.update({
			where: { sensorId },
			data: {
				name: data.name,
				sensorId: data.name,
				type: data.type,
				location: data.location,
				config: data.config,
				lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
				active: data.active ?? true,
			},
		});

		// todo: typear la data de config
		cacheRepository.set(`sensor:${sensorId}-updated`, JSON.stringify(data.config));

		res.json(sensor);
	} catch (error: any) {
		console.error("Error updating sensor:", error);

		if (error.code === "P2025") {
			return res.status(404).json({ error: "Sensor not found" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
};

// PATCH /sensors/:sensorId/deactivate
export const deactivateSensor = async (req: Request, res: Response) => {
	try {
		const { sensorId } = req.params;

		const sensor = await prisma.sensor.update({
			where: { sensorId },
			data: { active: false },
		});

		res.json({
			message: `Sensor ${sensorId} deactivated successfully.`,
			sensor,
		});
	} catch (error: any) {
		console.error("Error deactivating sensor:", error);

		if (error.code === "P2025") {
			return res.status(404).json({ error: "Sensor not found" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
};
