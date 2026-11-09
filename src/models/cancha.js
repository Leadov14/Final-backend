import mongoose from "mongoose";

const canchaSchema = new mongoose.Schema({

    deporte: {
        type: String,
        required: [true, "Campo obligatorio"],
        enum: { 
            values: ["basquet", "futbol", "tenis", "padel"],
            message: "'{VALUE}' no es un deporte válido"
        },
        lowercase: true,
        trim: true
    },

    nombre: {
        type: String,
        unique: true,
        required: [true, "Campo obligatorio"],
        minlength: [8, "Nombre debe tener 8 caracteres"],
        lowercase: true,
        trim: true
    },

    detalle: {
        type: String,
        required: [true, "Campo obligatorio"],
        minlength: [5, "Necesitas al menos 5 caracteres"],
        lowercase: true,
        trim: true
    },

    precio_hora: {
        type: Number,
        required: [true, "Campo obligatorio"],
        min: [10000, "El precio por hora debe tener al menos 5 cifras"],
    }

});

export default mongoose.model("Cancha", canchaSchema, "cancha");