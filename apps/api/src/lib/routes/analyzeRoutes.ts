import { Router } from "express";
import { getAnalysis } from "../controllers/analyzeCtrl";

const router = Router();

router.post("/", getAnalysis);

export default router;
