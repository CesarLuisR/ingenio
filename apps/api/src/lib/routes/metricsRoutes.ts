import { Router } from "express";
import {
  getSensorMetrics,
  getIngenioMetrics,
} from "../controllers/metricsCtrl";

const router = Router();

// Métricas de un sensor específico
router.get("/sensor/:id", getSensorMetrics);

// Métricas agregadas por ingenio (opcional, útil para dashboards globales)
router.get("/ingenio/:id", getIngenioMetrics);

export default router;
