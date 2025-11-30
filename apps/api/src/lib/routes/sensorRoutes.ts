import { Router } from "express";
import {
	getAllSensors,
	getSensorById,
	updateSensor,
	deactivateSensor,
	activateSensor,
	createSensor,
} from "../controllers/sensorCtrl";

const router = Router();

router.get("/", getAllSensors);
router.get("/:id", getSensorById);
router.post("/", createSensor);
router.put("/:id", updateSensor);
router.patch("/:id/deactivate", deactivateSensor);
router.patch("/:id/activate", activateSensor);

export default router;
