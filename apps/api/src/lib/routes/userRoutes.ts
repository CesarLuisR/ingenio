import { Router } from "express";
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/usersCtrl";

const router = Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
