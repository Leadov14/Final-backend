import Reserva from "../models/reserva.js";
import { verificarCancha } from "./serviceCancha.js";
import { ErrorApp } from "../utils/ErrorApp.js";


// --- CONTROLA SI EL USUARIO ES DUEÑO DE LA RESERVA O UN ADMINISTRADOR ---
const socio_admin = (reserva, usuario) => {
    if (usuario.rol === "admin") return true;
    if (!reserva.usuarioID) return false;
    const idSocio = reserva.usuarioID._id ?? reserva.usuarioID;
    return idSocio.toString() === usuario.id;
};


// ----- CREAR -----
export const crearReserva = async (datos, usuarioID) => {
    if (datos.canchaID) {
        await verificarCancha(datos.canchaID);
    }
    const ocupada = await Reserva.findOne({
        canchaID: datos.canchaID,
        estado: { $ne: "cancelada" },
        hora_inicio: { $lt: datos.hora_fin },
        hora_fin: { $gt: datos.hora_inicio },
    });
    if (ocupada) {
        throw new ErrorApp("La cancha no esta disponible en ese horario", 400);
    };
    const nuevaReserva = await Reserva.create({ ...datos, usuarioID});

    return await nuevaReserva.populate([
        {path: "usuarioID", select: "nombre apellido telefono email"},
        {path: "canchaID", select: "deporte nombre precio_hora"}
    ]);
};


// ----- LISTA DE RESERVAS Y FILTRO -----
export const listaReservas = async ({ usuarioID, canchaID } = {}) => {
    const filtro = {};
    if (usuarioID) {
        filtro.usuarioID = usuarioID;
    }
    if (canchaID) {
        filtro.canchaID = canchaID;
    }

    return await Reserva.find(filtro).populate([
        {path: "usuarioID", select: "nombre apellido"},
        {path: "canchaID", select: "nombre deporte precio_hora"}
    ]).sort({ hora_inicio: 1});
};


// ----- OBTENER RESERVA POR SU ID -----
export const obtenerIdReserva = async (id) => {
    return await Reserva.findById(id).populate([
        {path: "usuarioID", select: "nombre apellido email"},
        {path: "canchaID", select: "nombre deporte precio_hora"}
    ]);
};


// ----- VERIFICA LA EXISTENCIA DE LA RESERVA -----
export const verificarReserva = async (id) => {
    const reserva = await Reserva.findById(id);
    if (!reserva) {
        throw new ErrorApp("La reserva no fue encontrada", 404);
    }
    return reserva;
};


// --- AUTORIZA A VER LA RESERVA SI QUIEN LO PIDE ES EL DUEÑO O UN ADMINISTRADOR ---
export const reserva_autorizada = async (id, usuarioLogueado) => {
    const reserva = await obtenerIdReserva(id);
    if (!reserva) {
        throw new ErrorApp("Reserva inexistente", 404);
    }

    if (!socio_admin(reserva, usuarioLogueado)) {
        throw new ErrorApp ("No es posible acceder a las reservas de otro usuario", 403);
    }

    return reserva;
};


// ----- EDITAR -----
export const modificarReserva = async (id, datosEdit, usuarioLogueado) => {
    const mi_reserva = await verificarReserva(id);
    if (!socio_admin(mi_reserva, usuarioLogueado)) {
        throw new ErrorApp("Esa reserva pertenece a otro usuario", 403);
    }
    const cambios = { ...datosEdit };
    delete cambios.usuarioID;
    if (cambios.canchaID) {
        await verificarCancha(cambios.canchaID);
    }

    const nuevoEstado = cambios.estado ?? mi_reserva.estado;
    if (nuevoEstado !== "cancelada") {
        const nuevaHora_inicio = cambios.hora_inicio ?? mi_reserva.hora_inicio;
        const nuevaHora_fin = cambios.hora_fin ?? mi_reserva.hora_fin;
        const nuevaCanchaID = cambios.canchaID ?? mi_reserva.canchaID;

        const ocupada = await Reserva.findOne({
            _id: { $ne: id },
            canchaID: nuevaCanchaID,
            estado: { $ne: "cancelada" },
            hora_inicio: { $lt: nuevaHora_fin },
            hora_fin: { $gt: nuevaHora_inicio },
        });
        if (ocupada) {
            throw new ErrorApp("La cancha esta ocupada en ese horario", 400);
        }
    }
    mi_reserva.set(cambios);
    await mi_reserva.save();

    return await mi_reserva.populate([
        { path: "usuarioID", select: "nombre apellido email" },
        { path: "canchaID", select: "nombre deporte precio_hora" }
    ]);
};


// ----- ELIMINAR -----
export const eliminarReserva = async (id, usuarioLogueado) => {
    const mi_reserva = await verificarReserva(id);
    if(!socio_admin(mi_reserva, usuarioLogueado)) {
        throw new ErrorApp("Esta reserva pertenece a otro usuario", 403);
    }
    return await Reserva.findByIdAndDelete(id);
};


// --- VERIFICA SI UN USUARIO TIENE RESERVAS ACTIVAS (un usuario con reservas activas no ser eliminado) ---
export const reservasActivas = async (usuarioID) => {
    const reserva = await Reserva.exists({
        usuarioID,
        estado: { $ne: "cancelada" },
        hora_fin: { $gt: new Date() },
    })
    return reserva !== null;
};