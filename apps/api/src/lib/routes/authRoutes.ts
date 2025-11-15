import { Router } from "express";
import * as authCtrl from "../controllers/authCtrl";

const router = Router();

router.post("/login", authCtrl.loginCtrl);
router.post("/logout", authCtrl.logoutCtrl);
router.get("/session", authCtrl.getSessionCtrl);

export default router;