import { Router } from "express";
import { getDashboardHistory, getRecentActivity } from "../controllers/dashboardCtrl";

const router = Router();

// Ojo: Asegúrate de tener validación de sesión/permisos aquí
router.get("/:ingenioId/history", getDashboardHistory);
router.get("/:ingenioId/activity", getRecentActivity);

export default router;