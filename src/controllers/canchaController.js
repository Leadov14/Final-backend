import * as serviceCancha from "../services/serviceCancha.js";

export const crear = async (req, res) => {
    const cancha = await serviceCancha.crearCancha(req.body);
    res.status(201).json(cancha);
};

export const listar = async (req, res) => {
    const canchas = await serviceCancha.listaCanchas(req.query);
    res.status(200).json(canchas);
};

export const obtenerId = async (req, res) => {
    const cancha = await serviceCancha.verificarCancha(req.params.id);
    res.status(200).json(cancha);
};

export const actualizar = async (req, res) => {
    const cancha = await serviceCancha.modificarCancha(req.params.id, req.body);
    res.status(200).json(cancha);
};

export const eliminar = async (req, res) => {
    await serviceCancha.eliminarCancha(req.params.id);
    res.status(200).json({ mensaje: "La cancha se elimino correctamente" });
};