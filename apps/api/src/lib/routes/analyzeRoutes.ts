import { Router } from "express";
import { analyzeMachine } from "../controllers/analyzeCtrl";
// import { getAnalysis } from "../controllers/analysis.controller"; // El anterior

const router = Router();

// Ruta anterior (por lista de IDs)
// router.post("/", getAnalysis); 

// Nueva Ruta (por ID de máquina)
router.get("/machine/:id", analyzeMachine); 
// O POST si prefieres, pero GET es semánticamente correcto si no envías body

export default router;