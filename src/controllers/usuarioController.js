import * as serviceUsuario from "../services/serviceUsuario.js";

export const crear = async (req, res) => {
    const usuario = await serviceUsuario.crearUsuario(req.body);
    res.status(201).json(usuario);
};

export const listar = async (req, res) => {
    const usuarios = await serviceUsuario.listaUsuarios(req.query);
    res.status(200).json(usuarios);
};

export const obtenerId = async (req, res) => {
    const usuario = await serviceUsuario.usuarioAutorizado(req.params.id, req.usuario);
    res.status(200).json(usuario);
};

export const actualizar = async (req, res) => {
    const usuario = await serviceUsuario.modificarUsuario(req.params.id, req.body, req.usuario);
    res.status(200).json(usuario);
};

export const eliminar = async (req, res) => {
    await serviceUsuario.eliminarUsuario(req.params.id, req.usuario);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
};