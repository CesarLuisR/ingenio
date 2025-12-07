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


    const ingenio = user.ingenioId
        ? await prisma.ingenio.findUnique({ where: { id: user.ingenioId } })
        : null;

    if (!ingenio) {
        return res.json({ message: "Login successful", user: req.session.user });
    }

    if (ingenio?.active === false) {
        return res.status(401).json({ message: "Ingenio inactivo" });
    }

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    if (Array.isArray(ip)) ip = ip[0];

    prisma.auditLog.create({
        data: {
            userId: user.id,
            ingenioId: user.ingenioId,
            action: 'LOGIN', // Acción personalizada
            entity: 'Auth',
            entityId: user.id,
            ip: String(ip),
            meta: { method: 'email/password' } // Opcional
        }
    }).catch(console.error);

    res.json({ message: "Login successful", user: req.session.user });
};

export const logoutCtrl: RequestHandler = (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    };

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
    });

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    if (Array.isArray(ip)) ip = ip[0];

    prisma.auditLog.create({
        data: {
            userId: user.id,
            ingenioId: user.ingenioId,
            action: 'LOGIN', // Acción personalizada
            entity: 'Auth',
            entityId: user.id,
            ip: String(ip),
            meta: { method: 'email/password' } // Opcional
        }
    }).catch(console.error);
}

export const getSessionCtrl: RequestHandler = (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
}