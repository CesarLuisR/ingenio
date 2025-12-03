import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import RedisRepository from "../repositories/cache/redisRepository";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";
import { ConfigData } from "../../types/sensorTypes";
import { toConfigJson } from "../utils/toConfigJson";

const cacheRepository = new RedisRepository();

/* ----------------------------------------------------------
   GET /sensors
----------------------------------------------------------- */

export const getAllSensors = async (req: Request, res: Response) => {
    try {
        const user = req.session.user;

        // 1. Seguridad básica
        if (!user || (user.role !== UserRole.SUPERADMIN && !user.ingenioId)) {
            return res.json({
                data: [],
                meta: {
                    totalItems: 0,
                    currentPage: 1,
                    totalPages: 0,
                    itemsPerPage: Number(req.query.limit) || 10,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            });
        }

        // 2. WHERE base por rol / ingenio
        const where: any = {
            AND: [],
        };

        if (user.role !== UserRole.SUPERADMIN) {
            // ADMIN, TECNICO, LECTOR: se fuerza ingenioId
            where.AND.push({ ingenioId: user.ingenioId });
        } else {
            // SUPERADMIN: puede filtrar por ingenioId
            const { ingenioId } = req.query;
            if (ingenioId) {
                where.AND.push({ ingenioId: Number(ingenioId) });
            }
        }

        // 3. MODO SIMPLE (para selects, cálculos ligeros, etc.)
        if (req.query.simple) {
            const sensors = await prisma.sensor.findMany({
                select: {
                    id: true,
                    sensorId: true,
                    name: true,
                    type: true,
                    location: true,
                    active: true,
                    config: true,
                    lastSeen: true,
                    machineId: true,
                    ingenioId: true,
                    createdAt: true,
                },
                where,
                orderBy: {
                    name: "asc",
                },
            });

            return res.json(sensors);
        }

        // 4. Paginación
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // 5. Ordenamiento
        const sortField = req.query.sortBy?.toString() || "createdAt";
        const sortDir = req.query.sortDir?.toString() === "asc" ? "asc" : "desc";

        const validSortFields = ["name", "sensorId", "type", "createdAt", "updatedAt"];

        const orderBy: any = validSortFields.includes(sortField)
            ? { [sortField]: sortDir }
            : { createdAt: "desc" };

        // 6. Filtros

        // 6.1 Filtro por activo (columna active = habilitado/deshabilitado)
        const activeParam = req.query.active;
        if (activeParam !== undefined) {
            const isActive = activeParam === "true" || activeParam === "yes";
            where.AND.push({ active: isActive });
        }

        // 6.2 Filtro por máquina
        const machineId = req.query.machineId;
        if (machineId) {
            where.AND.push({ machineId: Number(machineId) });
        }

        // 6.3 Filtro por sensores "sin configurar"
        const unconfiguredParam = req.query.unconfigured;
        if (unconfiguredParam === "true") {
            where.AND.push({ name: "NOCONFIGURADO" });
        }

        // 6.4 Filtro por búsqueda
        const rawSearch = req.query.search?.toString()?.trim();
        if (rawSearch) {
            const search = rawSearch.toLowerCase();
            where.AND.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { sensorId: { contains: search, mode: "insensitive" } },
                    { type: { contains: search, mode: "insensitive" } },
                    { location: { contains: search, mode: "insensitive" } },
                    {
                        machine: {
                            name: { contains: search, mode: "insensitive" },
                        },
                    },
                    {
                        machine: {
                            code: { contains: search, mode: "insensitive" },
                        },
                    },
                ],
            });
        }

        // 6.5 Filtro por lista de IDs (para filtros avanzados calculados en frontend)
        const idsParam = req.query.ids;
        if (idsParam) {
            const rawList = Array.isArray(idsParam) ? idsParam : [idsParam];
            const ids = rawList
                .map((v) => Number(v))
                .filter((n) => !Number.isNaN(n));

            if (ids.length === 0) {
                // Si la lista de IDs está vacía ⇒ devolvemos inmediatamente vacío
                return res.json({
                    data: [],
                    meta: {
                        totalItems: 0,
                        currentPage: page,
                        totalPages: 0,
                        itemsPerPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: page > 1,
                    },
                });
            }

            where.AND.push({ id: { in: ids } });
        }

        // Limpieza: si no hay filtros en AND, Prisma prefiere undefined
        if (!where.AND.length) {
            delete where.AND;
        }

        // 7. Ejecución en transacción
        const [sensors, total] = await prisma.$transaction([
            prisma.sensor.findMany({
                where,
                include: {
                    failures: true,
                    machine: true,
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.sensor.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        // 8. Respuesta
        return res.json({
            data: sensors,
            meta: {
                totalItems: total,
                currentPage: page,
                totalPages,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching sensors:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


/* ----------------------------------------------------------
   GET /sensors/:sensorId
----------------------------------------------------------- */
export const getSensorById = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);

		const sensor = await prisma.sensor.findUnique({
			where: { id },
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
   POST /sensors
----------------------------------------------------------- */
export const createSensor = async (req: Request, res: Response) => {
	try {
		const data: ConfigData = req.body;

		const sensor = await prisma.sensor.create({
			data: {
				sensorId: data.sensorId,
				name: "NOCONFIGURADO",
				type: "NOCONFIGURADO",
				location: "NOCONFIGURADO",
				config: toConfigJson({
                    sensorId: data.sensorId,
                    name: "NOCONFIGURADO",
                    machineId: data.machineId,
                    ingenioId: data.ingenioId,
                    type: "NOCONFIGURADO",
                    intervalMs: 1000,
                    metricsConfig: {},
                    configVersion: "v1"
                }),
				lastSeen: new Date(),
				createdAt: new Date(),
				machineId: data.machineId,
				ingenioId: data.ingenioId
			}
		});

		res.json(sensor);
	} catch (error) {
		console.error("Error creating sensor:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/* ----------------------------------------------------------
   PUT /sensors/:sensorId
----------------------------------------------------------- */
export const updateSensor = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const data = req.body;

		// Primero buscamos el sensor para validar ingenio
		const existing = await prisma.sensor.findUnique({
			where: { id },
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
			where: { id },
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
				`sensor:${updated.sensorId}-updated`,
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
		const id = Number(req.params.id);

		// Primero validamos que exista y pertenezca al ingenio
		const existing = await prisma.sensor.findUnique({
			where: { id },
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
			`sensor:${existing.sensorId}-updated`,
			JSON.stringify(currentConfig)
		);

		const sensor = await prisma.sensor.update({
			where: { id },
			data: { active: false, config: currentConfig },
		});

		return res.json({
			message: `Sensor ${existing.sensorId} deactivated successfully.`,
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
		const id = Number(req.params.id);

		const existing = await prisma.sensor.findUnique({
			where: { id },
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
			`sensor:${existing.sensorId}-updated`,
			JSON.stringify(currentConfig)
		);

		const sensor = await prisma.sensor.update({
			where: { id },
			data: { active: true, config: currentConfig },
		});

		return res.json({
			message: `Sensor ${existing.sensorId} activated successfully.`,
			sensor,
		});
	} catch (error: any) {
		console.error("Error activating sensor:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};