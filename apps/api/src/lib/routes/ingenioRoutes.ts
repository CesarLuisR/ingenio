import { Router } from "express";
import {
    getAllIngenios,
    getIngenioById,
    createIngenio,
    updateIngenio,
    deleteIngenio,
} from "../controllers/ingenioCtrl";

const router = Router();

// GET /api/ingenios
router.get("/", getAllIngenios);

// GET /api/ingenios/:id
router.get("/:id", getIngenioById);

// POST /api/ingenios
router.post("/", createIngenio);

// PUT /api/ingenios/:id
router.put("/:id", updateIngenio);

// DELETE /api/ingenios/:id
router.delete("/:id", deleteIngenio);

export default router;
