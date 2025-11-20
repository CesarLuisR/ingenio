import { Router } from "express";
import {
	getAllSensors,
	getSensorById,
	updateSensor,
	deactivateSensor,
} from "../controllers/sensorCtrl";

const router = Router();

router.get("/", getAllSensors);
router.get("/:sensorId", getSensorById);
router.put("/:sensorId", updateSensor);
router.patch("/:sensorId/deactivate", deactivateSensor);

export default router;
