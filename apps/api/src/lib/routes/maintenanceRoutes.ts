import { Router } from "express";
import {
  getAllMaintenances,
  createMaintenance,
} from "../controllers/maintenanceCtrl";

const router = Router();

router.get("/", getAllMaintenances);
router.post("/", createMaintenance);

export default router;
