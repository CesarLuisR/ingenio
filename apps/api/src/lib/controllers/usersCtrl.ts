import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import { hashPassword } from "../utils/bcrypt";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        where: { ingenioId: req.session.user?.ingenioId },
    });
    res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
    if (!hasPermission(
        req.session.user?.role as UserRole,
        UserRole.ADMIN, 
    )) return res.status(403).json({ message: "Forbidden access " });

    const { email, name, role, password, ingenioId } = req.body;

    const hash = await hashPassword(password);
    const user = await prisma.user.create({
        data: { email, name, role, passwordHash: hash, ingenioId },
    });
    res.status(201).json(user);
};

/* ------------------------------------------
   PUT: Editar usuario (solo admin)
------------------------------------------- */
export const updateUser = async (req: Request, res: Response) => {
    if (!hasPermission(
        req.session.user?.role as UserRole,
        UserRole.ADMIN, 
    )) return res.status(403).json({ message: "Forbidden access " });
    
    const userId = Number(req.params.id);

    const currentUser = req.session.user;
    if (!currentUser) {
        return res.status(401).json({ error: "No authenticated" });
    }

    if (currentUser.role !== "admin") {
        return res.status(403).json({ error: "Solo administradores pueden editar usuarios" });
    }

    const { email, name, role, password, ingenioId } = req.body;

    // Evitar editar usuarios de otro ingenio
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return res.status(404).json({ error: "Usuario no encontrado" });
    if (target.ingenioId !== currentUser.ingenioId) {
        return res.status(403).json({ error: "No puedes editar usuarios de otro ingenio" });
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
};

/* ------------------------------------------
   DELETE: Eliminar usuario (solo admin)
------------------------------------------- */
export const deleteUser = async (req: Request, res: Response) => {
    if (!hasPermission(
        req.session.user?.role as UserRole,
        UserRole.ADMIN, 
    )) return res.status(403).json({ message: "Forbidden access " });

    const userId = Number(req.params.id);

    // todo: Mira aqui todas las validaciones que debe de hacer la funcion
    const currentUser = req.session.user;

    if (!currentUser) {
        return res.status(401).json({ error: "No authenticated" });
    }

    if (currentUser.role !== "admin") {
        return res.status(403).json({ error: "Solo administradores pueden eliminar usuarios" });
    }

    if (currentUser.id === userId) {
        return res.status(400).json({ error: "No puedes eliminar tu propio usuario" });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return res.status(404).json({ error: "Usuario no encontrado" });

    if (target.ingenioId !== currentUser.ingenioId) {
        return res.status(403).json({ error: "No puedes eliminar usuarios de otro ingenio" });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.status(204).send();
};