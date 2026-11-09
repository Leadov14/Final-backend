import jwt from "jsonwebtoken";
import { ErrorApp } from "../utils/ErrorApp.js";
import { JWT_SECRET } from "../utils/config.js";

export const verificarToken = (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        throw new ErrorApp("Falta el token. Mandá el header Authorization: Bearer <token>", 401);
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.usuario = { id: payload.id, rol: payload.rol };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ErrorApp("Token vencido, volve a iniciar sesion", 401);
        }
        throw new ErrorApp("Token invalido", 401);
    }
};