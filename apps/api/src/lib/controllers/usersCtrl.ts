import bcrypt from "bcryptjs";
import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import { hashPassword } from "../utils/bcrypt";

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        where: { ingenioId: req.session.user?.ingenioId },
    });
    res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
    const { email, name, role, password, ingenioId } = req.body;

    const hash = await hashPassword(password);
    const user = await prisma.user.create({
        data: { email, name, role, passwordHash: hash, ingenioId },
    });
    res.status(201).json(user);
};
