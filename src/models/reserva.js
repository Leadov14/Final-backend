import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({

    usuarioID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Este campo es obligatorio']
    },

    canchaID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cancha',
        required: [true, 'Este campo es obligatorio']
    },

    hora_inicio: {
        type: Date,
        required: [true, 'Elija la fecha y hora de su reserva']
    },

    hora_fin: {
        type: Date,
        required: [true, 'Eliga la fecha y hora final de su reserva']
    },

    estado: {
        type: String,
        enum: {
            values: ["confirmada", "pendiente", "cancelada"],
            message: "'{VALUE}' no es un estado válido"
        },
        default: "pendiente"
    },

}, { timestamps: true });

reservaSchema.pre("validate", function () {
    if (this.hora_inicio && this.hora_fin && this.hora_fin <= this.hora_inicio) {
        this.invalidate ("hora_fin", "hora fin debe ser posterior a hora inicio");
    }
});

export default mongoose.model("Reserva", reservaSchema, "reserva");