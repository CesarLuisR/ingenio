import { RequestHandler } from "express";
import { comparePassword } from "../utils/bcrypt";
import prisma from "../../database/postgres.db";

export const loginCtrl: RequestHandler = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ingenioId: user.ingenioId
    };

    res.json({ message: "Login successful", user: req.session.user });
};

export const logoutCtrl: RequestHandler = (req, res) => {   
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
    });
}