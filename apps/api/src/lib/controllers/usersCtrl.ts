import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import { hashPassword } from "../utils/bcrypt";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllUsers = async (req: Request, res: Response) => {
    const currentUser = req.session.user;
    const whereClause: any = {};

    // Si NO es superadmin, filtrar por su ingenio
    if (currentUser?.role !== UserRole.SUPERADMIN) {
        whereClause.ingenioId = currentUser?.ingenioId;
    } else {
        // Si es SUPERADMIN, permitir filtrar por query param
        const { ingenioId } = req.query;
        if (ingenioId) {
            whereClause.ingenioId = Number(ingenioId);
        }
    }

    const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { ingenio: true } // Incluir info del ingenio para que el superadmin sepa de dónde son
    });
    res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
    try {
        // Solo ADMIN o SUPERADMIN pueden crear
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const { email, name, role, password, ingenioId } = req.body;
        const currentUser = req.session.user;

        // Validar que si es ADMIN (no super), solo cree usuarios para su propio ingenio
        if (currentUser?.role !== UserRole.SUPERADMIN) {
            if (ingenioId && Number(ingenioId) !== currentUser?.ingenioId) {
                return res.status(403).json({ message: "No puedes crear usuarios para otro ingenio" });
            }
            // Si no envía ingenioId, se asigna el suyo por defecto (aunque el front debería enviarlo)
        }

        // Validar email duplicado
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "El correo electrónico ya está registrado" });
        }

        const hash = await hashPassword(password);

        // Preparar data. Si es superadmin creando otro superadmin, ingenioId puede ser null.
        // Si es admin, ingenioId es obligatorio (o se fuerza al suyo).
        const finalIngenioId = currentUser?.role === UserRole.SUPERADMIN ? (ingenioId ? Number(ingenioId) : null) : currentUser?.ingenioId;

        // todo: ERROR QUE PUEDE SER PENDEJO
        const user = await prisma.user.create({
            data: { email, name, role, passwordHash: hash, ingenioId: finalIngenioId! },
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

        // Si NO es superadmin, verificar que el target sea de su mismo ingenio
        if (currentUser.role !== UserRole.SUPERADMIN) {
            if (target.ingenioId !== currentUser.ingenioId) {
                return res.status(403).json({ error: "No puedes editar usuarios de otro ingenio" });
            }
            // Y no permitir cambiar el ingenioId a otro
            if (ingenioId && Number(ingenioId) !== currentUser.ingenioId) {
                return res.status(403).json({ error: "No puedes mover usuarios a otro ingenio" });
            }
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
            // Si es superadmin, puede cambiar el ingenioId (o dejarlo null)
            // Si es admin, mantenemos el ingenioId original (o el suyo, que es lo mismo)
            ingenioId: currentUser.role === UserRole.SUPERADMIN ? (ingenioId ? Number(ingenioId) : null) : target.ingenioId,
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

export const changePassword = async (req: Request, res: Response) => {
    try {
        const currentUser = req.session.user;
        if (!currentUser) {
            return res.status(401).json({ error: "No authenticated" });
        }

        if (!req.body.password) {
            return res.status(400).json({ error: "No password provided" });
        }

        const user = await prisma.user.update({
            where: { id: currentUser.id },
            data: { passwordHash: await hashPassword(req.body.password) },
        });

        res.json(user);
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Error interno al actualizar contraseña" });
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

        if (currentUser.role !== UserRole.SUPERADMIN && target.ingenioId !== currentUser.ingenioId) {
            return res.status(403).json({ error: "No puedes eliminar usuarios de otro ingenio" });
        }

        await prisma.user.delete({ where: { id: userId } });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error interno al eliminar usuario" });
    }
};