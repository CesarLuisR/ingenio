import { Router } from "express";
import {
  getAllSensors,
  getSensorById,
  createSensor,
  updateSensor,
  deleteSensor,
  getActiveSensors
} from "../controllers/sensorCtrl";

const router = Router();

router.get("/", getAllSensors);
router.get("/activeSensors", getActiveSensors);
router.get("/:id", getSensorById);
router.post("/", createSensor);
router.put("/:id", updateSensor);
router.delete("/:id", deleteSensor);

export default router;
