import * as authService from "../services/serviceAuth.js";

export const registrar = async (req, res) => {
    const datos = await authService.registrar(req.body);
    res.status(201).json(datos);
};

export const login = async (req, res) => {
    const datos = await authService.login(req.body);
    res.status(200).json(datos);
};