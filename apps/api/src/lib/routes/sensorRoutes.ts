import { Router } from "express";
import {
	getAllSensors,
	getSensorById,
	updateSensor,
	deactivateSensor,
	activateSensor,
} from "../controllers/sensorCtrl";

const router = Router();

router.get("/", getAllSensors);
router.get("/:sensorId", getSensorById);
router.put("/:sensorId", updateSensor);
router.patch("/:sensorId/deactivate", deactivateSensor);
router.patch("/:sensorId/activate", activateSensor);

export default router;
