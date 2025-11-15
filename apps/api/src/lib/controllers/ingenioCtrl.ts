import { RequestHandler } from "express";
import prisma from "../../database/postgres.db";

export const getAllIngenios: RequestHandler = async (_, res) => {
    const ingenios = await prisma.ingenio.findMany();
    res.json(ingenios);
};

export const getIngenioById: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);

    const ingenio = await prisma.ingenio.findUnique({
        where: { id },
    });

    if (!ingenio) {
        return res.status(404).json({ message: "Ingenio not found" });
    }

    res.json(ingenio);
};

export const createIngenio: RequestHandler = async (req, res) => {
    const { name, code, location } = req.body;

    if (!name || !code) {
        return res.status(400).json({ message: "name and code are required" });
    }

    const ingenio = await prisma.ingenio.create({
        data: { name, code, location },
    });

    res.status(201).json(ingenio);
};

export const updateIngenio: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    const { name, code, location } = req.body;

    const ingenio = await prisma.ingenio.update({
        where: { id },
        data: { name, code, location },
    });

    res.json(ingenio);
};

export const deleteIngenio: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);

    await prisma.ingenio.delete({
        where: { id },
    });

    res.status(204).send();
};
