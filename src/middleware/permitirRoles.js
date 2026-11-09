import { ErrorApp } from "../utils/ErrorApp.js";

export const permitirRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            throw new ErrorApp(`Esta acción requiere rol de ${roles.join(", ")}`, 403)
        }
        next();
    };
};