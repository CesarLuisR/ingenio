import prisma from "../../database/postgres.db";
import { Request, Response } from "express";

export const getAllUsers = async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
    const { email, name, role } = req.body;
    const user = await prisma.user.create({
        data: { email, name, role },
    });
    res.status(201).json(user);
};
