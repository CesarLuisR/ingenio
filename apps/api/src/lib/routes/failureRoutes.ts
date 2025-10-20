import { Router } from "express";
import {
  getAllFailures,
  createFailure,
} from "../controllers/failureCtrl";

const router = Router();

router.get("/", getAllFailures);
router.post("/", createFailure);

export default router;
