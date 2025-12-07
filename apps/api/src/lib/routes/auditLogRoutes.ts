import { Router } from "express";
import {
    getAuditLog
} from "../controllers/auditLogCtrl";

const router = Router();

router.get("/", getAuditLog);

export default router;