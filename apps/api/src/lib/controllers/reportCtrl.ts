import { RequestHandler } from "express";
import { processUserQuery } from "../services/processUserQuery";
import { UserRole } from "@prisma/client";

export const reportCtrl: RequestHandler = async (req, res) => {
    const { query } = req.body;

    // Asumimos que tu middleware 'requireAuth' puebla req.user
    // req.user debería tener { id, role, ingenioId }
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ message: "No authenticated" });
    }

    if (!query) {
        return res.status(400).json({ type: 'ERROR', message: "La consulta es requerida" });
    }

    // Llamamos a nuestro controlador agnóstico
    try {
        const response = await processUserQuery({
            id: user?.id,
            role: user?.role as UserRole,
            ingenioId: user?.ingenioId,
        }, query);

        // Devolvemos la respuesta JSON
        res.json(response);
    } catch(err) {
        console.error("HUBO UN ERROR: ", err);
    }
}