import { Router } from "express";
import {
  getAllFailures,
  getFailureById,
  createFailure,
  updateFailure,
  deleteFailure,
} from "../controllers/failureCtrl";

const router = Router();

// Obtener todas las fallas
router.get("/", getAllFailures);

// Obtener una falla específica
router.get("/:id", getFailureById);

// Crear una nueva falla
router.post("/", createFailure);

// Actualizar una falla
router.put("/:id", updateFailure);

// Eliminar una falla
router.delete("/:id", deleteFailure);

export default router;
