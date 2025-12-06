import { Router } from "express";
import { reportCtrl} from "../controllers/reportCtrl";

const router = Router();

router.post("/", reportCtrl);

export default router;
