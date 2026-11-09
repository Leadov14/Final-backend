import Usuario from "../models/usuario.js";
import { reservasActivas } from "./serviceReserva.js";
import { ErrorApp } from "../utils/ErrorApp.js";


// --- CONTROLA SI EL USUARIO ES EL DUEÑO DE LA CUENTA O UN ADMINISTRADOR ---
const adminOsocio = (usuario, usuarioLogueado) => {
    if (usuarioLogueado.rol === "admin") return true;
    return usuario._id.toString() === usuarioLogueado.id;
};


// ----- CREAR -----
export const crearUsuario = async (datos) => {
    return await Usuario.create(datos);
};


// ----- LISTA DE USUARIOS Y FILTRO  -----
export const listaUsuarios = async ({ apellido } = {}) => {
    const filtro = {}
    if (apellido) {
        filtro.apellido = apellido.toLowerCase();
    }
    return await Usuario.find(filtro).sort({ apellido:1 });
};


// ----- OBTENER USUARIO POR SU ID -----
export const obtenerIdUsuario = async (id) => {
    return await Usuario.findById(id);
};


// ----- VERIFICA QUE EL USUARIO EXISTE -----
export const verificarUsuario = async (id) => {
    const usuario = await obtenerIdUsuario(id);
    if (!usuario) {
        throw new ErrorApp("El usuario no fue encontrado", 404);
    }

    return usuario;
};


// --- AUTORIZA A VER SU PERFIL SI QUIEN LO PIDE ES DUEÑO DE LA CUENTA O ADMINISTRADOR ---
export const usuarioAutorizado = async (id, usuarioLogueado) => {
    const usuario = await verificarUsuario(id);
    if (!adminOsocio(usuario, usuarioLogueado)) {
        throw new ErrorApp("No podes acceder a los datos de otro usuario", 403);
    }

    return usuario;
};


// ----- EDITAR -----
export const modificarUsuario = async (id, datosEdit, usuarioLogueado) => {
    const usuario = await verificarUsuario(id);
    if (!adminOsocio(usuario, usuarioLogueado)) {
        throw new ErrorApp("No es posible modificar los datos de otro usuario", 403);
    }
    const cambios = { ...datosEdit };
    if (usuarioLogueado.rol !== "admin") {
        delete cambios.rol;
    }
    
    usuario.set(cambios);
    await usuario.save();
    return usuario;
};


// ----- ELIMINAR -----
export const eliminarUsuario = async (id, usuarioLogueado) => {
    const usuario = await verificarUsuario(id);
    if(!adminOsocio(usuario, usuarioLogueado)) {
        throw new ErrorApp("No podes eliminar la cuenta de otro usuario", 403);
    }
    if (await reservasActivas(id)) {
        throw new ErrorApp("Debes cancelar las reservas activas para borrar tu cuenta", 409);
    }
    
    return await Usuario.findByIdAndDelete(id);
};


// ----- OBJETO QUE DEVUELVE AL CLIENTE SIN LA CONTRASEÑA -----
export const datosPublicosUsuario = (usuario) => ({
    _id: usuario._id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol
});


// ----- BUSCA USUARIO POR EMAIL INCLUYENDO SU PASSWORD HASHEADA PARA LOGIN -----
export const emailConPassword = async (email) => {
    return await Usuario.findOne ({ email: email.toLowerCase() }).select("+password");
};

