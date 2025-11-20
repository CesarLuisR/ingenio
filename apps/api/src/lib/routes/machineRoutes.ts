import { Router } from "express";
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} from "../controllers/machineCtrl";

const router = Router();

// Obtener todas las máquinas
router.get("/", getAllMachines);

// Obtener máquina por ID
router.get("/:id", getMachineById);

// Crear una nueva máquina
router.post("/", createMachine);

// Actualizar una máquina existente
router.put("/:id", updateMachine);

// Eliminar una máquina
router.delete("/:id", deleteMachine);

export default router;
