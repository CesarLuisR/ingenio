import { Router } from "express";
import {
    getMachineMetrics,
    getIngenioMetrics,
    getSensorHealth
} from "../controllers/metricsCtrl";

const router = Router();

router.get("/machine/:id", getMachineMetrics);
router.get("/ingenio/:id", getIngenioMetrics);
router.get("/sensor/:id/health", getSensorHealth);

export default router;
