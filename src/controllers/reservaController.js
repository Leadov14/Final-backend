import * as serviceReserva from "../services/serviceReserva.js";

export const crear = async (req, res) => {
    const reserva = await serviceReserva.crearReserva(req.body, req.usuario.id);
    res.status(201).json(reserva);
};

export const listar = async (req, res) => {
    const reservas = await serviceReserva.listaReservas(req.query);
    res.status(200).json(reservas);
};

export const obtenerId = async (req, res) => {
    const reserva = await serviceReserva.reserva_autorizada(req.params.id, req.usuario);
    res.status(200).json(reserva);
};

export const misReservas = async (req, res) => {
    const reservas = await serviceReserva.listaReservas({ usuarioID: req.usuario.id });
    res.status(200).json(reservas);
}

export const actualizar = async (req, res) => {
    const reserva = await serviceReserva.modificarReserva(req.params.id, req.body, req.usuario);
    res.status(200).json(reserva);
};

export const eliminar = async (req, res) => {
    await serviceReserva.eliminarReserva(req.params.id, req.usuario);
    res.status(200).json({ mensaje: "Reserva eliminada correctamente" });
};