import { Router } from "express";
import {
    getAllIngenios,
    getIngenioById,
    createIngenio,
    updateIngenio,
    deleteIngenio,
    activateIngenio,
    deactivateIngenio
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

// PUT /api/ingenios/:id/activate
router.put("/:id/activate", activateIngenio);

// PUT /api/ingenios/:id/deactivate
router.put("/:id/deactivate", deactivateIngenio);

export default router;
