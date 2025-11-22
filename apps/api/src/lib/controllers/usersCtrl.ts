import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import { hashPassword } from "../utils/bcrypt";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        where: { ingenioId: req.session.user?.ingenioId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
    try {
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const { email, name, role, password, ingenioId } = req.body;

        // Validar email duplicado
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "El correo electrónico ya está registrado" });
        }

        const hash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, name, role, passwordHash: hash, ingenioId },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error interno al crear usuario" });
    }
};

/* ------------------------------------------
   PUT: Editar usuario (solo admin)
------------------------------------------- */
export const updateUser = async (req: Request, res: Response) => {
    try {
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const userId = Number(req.params.id);
        const currentUser = req.session.user;

        if (!currentUser) {
            return res.status(401).json({ error: "No authenticated" });
        }

        const { email, name, role, password, ingenioId } = req.body;

        // Evitar editar usuarios de otro ingenio
        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (!target) return res.status(404).json({ error: "Usuario no encontrado" });

        if (target.ingenioId !== currentUser.ingenioId && currentUser.role !== UserRole.SUPERADMIN) {
            return res.status(403).json({ error: "No puedes editar usuarios de otro ingenio" });
        }

        // Validar email duplicado si se está cambiando
        if (email !== target.email) {
            const existingEmail = await prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                return res.status(409).json({ message: "El correo electrónico ya está en uso por otro usuario" });
            }
        }

        const data: any = {
            email,
            name,
            role,
            ingenioId,
        };

        // Si se envía password → hash nuevo
        if (password && password.trim() !== "") {
            data.passwordHash = await hashPassword(password);
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data,
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error interno al actualizar usuario" });
    }
};

/* ------------------------------------------
   DELETE: Eliminar usuario (solo admin)
------------------------------------------- */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const userId = Number(req.params.id);
        const currentUser = req.session.user;

        if (!currentUser) {
            return res.status(401).json({ error: "No authenticated" });
        }

        if (currentUser.id === userId) {
            return res.status(400).json({ error: "No puedes eliminar tu propio usuario" });
        }

        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (!target) return res.status(404).json({ error: "Usuario no encontrado" });

        if (target.ingenioId !== currentUser.ingenioId && currentUser.role !== UserRole.SUPERADMIN) {
            return res.status(403).json({ error: "No puedes eliminar usuarios de otro ingenio" });
        }

        await prisma.user.delete({ where: { id: userId } });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error interno al eliminar usuario" });
    }
};