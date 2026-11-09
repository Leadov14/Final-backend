import Cancha from "../models/cancha.js";
import Reserva from "../models/reserva.js";
import { ErrorApp } from "../utils/ErrorApp.js";


// ----- CREAR -----
export const crearCancha = async (datos) => {
    return await Cancha.create(datos);
};


// ----- LISTA DE CANCHAS Y FILTRO -----
export const listaCanchas = async ({ deporte, nombre } = {}) => {
    const filtro = {}
    if (deporte) {
        filtro.deporte = deporte.toLowerCase();
    }
    if (nombre) {
        filtro.nombre = nombre.toLowerCase();
    }

    return await Cancha.find(filtro).sort({ nombre:1 });
};


// ----- OBTENER CANCHA POR SU ID -----
export const obtenerIdCancha = async (id) => {
    return await Cancha.findById(id);
};


// ----- VERIFICA QUE LA CANCHA EXISTE -----
export const verificarCancha = async (id) => {
    const cancha = await obtenerIdCancha(id);
    if (!cancha) {
        throw new ErrorApp("No se encontro la cancha", 404);
    }

    return cancha;
};


// ----- EDITAR -----
export const modificarCancha = async (id, datosEdit) => {
    await verificarCancha(id);
    return await Cancha.findByIdAndUpdate(id, datosEdit, {returnDocument: "after", runValidators: true});
};


// ----- ELIMINAR (una cancha con reservas activas no puede ser eliminada) -----
export const eliminarCancha = async (id) => {
    await verificarCancha(id);
    const reservaExistente = await Reserva.exists({
        canchaID: id,
        estado: { $ne: "cancelada" },
        hora_fin: { $gt: new Date() },
    });
    if (reservaExistente) {
        throw new ErrorApp("No se puede eliminar una cancha con reservas pendientes", 409);
    }

    return await Cancha.findByIdAndDelete(id);
};