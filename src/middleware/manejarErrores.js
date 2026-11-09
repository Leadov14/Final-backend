export const manejarErrores = (error, req, res, next) => {
    if (error.name === "ErrorApp") {
        return res.status(error.status).json({ error: error.message });
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "El JSON no es valido"});
    }

    if (error.name === "CastError") {
        return res.status(400).json({ error: "Ese ID no tiene formato valido", recibido: error.value});
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            error: "Los datos no son validos",
            detalles: Object.values(error.errors).map(e => ({
                campo: e.path,
                mensaje: e.message
            }))
        });
    }

    if (error.code === 11000) {
        return res.status(400).json({ error: "Ya existe un registro con ese dato", campo: Object.keys(error.keyPattern)[0] });
    }

    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
};