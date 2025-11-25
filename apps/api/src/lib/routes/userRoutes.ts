import { Router } from "express";
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
} from "../controllers/usersCtrl";

const router = Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.post("/change-password", changePassword);
router.delete("/:id", deleteUser);

export default router;
