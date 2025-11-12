import { Router } from "express";
import {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../controllers/maintenanceCtrl";

const router = Router();

// Obtener todos los mantenimientos
router.get("/", getAllMaintenances);

// Obtener mantenimiento por ID
router.get("/:id", getMaintenanceById);

// Crear un nuevo mantenimiento
router.post("/", createMaintenance);

// Actualizar un mantenimiento existente
router.put("/:id", updateMaintenance);

// Eliminar un mantenimiento
router.delete("/:id", deleteMaintenance);

export default router;
