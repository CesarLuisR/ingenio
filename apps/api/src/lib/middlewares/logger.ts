import { RequestHandler } from 'express';
import { requestContext } from '../utils/ctxStorage';

export const logger: RequestHandler = (req, res, next) => {
    // 1. Intentamos obtener el usuario de la sesión (ajusta según tu auth real)
    const user = (req as any).session?.user; 

    // 2. Obtenemos la IP de forma robusta
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    if (Array.isArray(ip)) ip = ip[0];

    // 3. Si hay usuario, ejecutamos el resto de la app DENTRO del contexto
    if (user) {
        requestContext.run({ user, ip: String(ip) }, () => {
            next();
        });
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }
};