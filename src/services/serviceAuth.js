import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRA } from "../utils/config.js";
import { crearUsuario, datosPublicosUsuario, emailConPassword } from "./serviceUsuario.js";
import { ErrorApp } from "../utils/ErrorApp.js";


// ----- FIRMA EL TOKEN JWT -----
const firmarToken = (usuario) => {
    return jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRA }
    );
};


// ----- REGISTRO -----
export const registrar = async ({nombre, apellido, email, password, telefono} = {}) => {
    const usuario = await crearUsuario({ nombre, apellido, email, password, telefono });
    return { usuario: datosPublicosUsuario(usuario), token: firmarToken(usuario) };
};


// ----- LOGIN -----
export const login = async ({ email, password } = {}) => {
    if (typeof email !== "string" || typeof password !== "string") {
        throw new ErrorApp("Faltan datos", 400);
    }

    const usuario = await emailConPassword(email);
    if (!usuario || !(await usuario.compararPassword(password))) {
        throw new ErrorApp("Alguno de tus datos es incorrecto", 401);
    }

    return { usuario: datosPublicosUsuario(usuario), token: firmarToken(usuario) };
};