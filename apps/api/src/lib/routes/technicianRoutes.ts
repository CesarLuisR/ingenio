import { Router } from "express";
import {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
} from "../controllers/technicianCtrl";

const router = Router();

// Listar todos los técnicos
router.get("/", getAllTechnicians);

// Obtener técnico por ID
router.get("/:id", getTechnicianById);

// Crear técnico nuevo
router.post("/", createTechnician);

// Actualizar técnico
router.put("/:id", updateTechnician);

// Eliminar técnico
router.delete("/:id", deleteTechnician);

export default router;
