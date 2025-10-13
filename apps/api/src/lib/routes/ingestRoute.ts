import { Router } from "express";
import { ingestCtrl } from "../controllers/ingestCtrl";

const router = Router();

router.post("/", ingestCtrl);

export default router;
