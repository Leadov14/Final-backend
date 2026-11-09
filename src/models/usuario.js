import mongoose from "mongoose";
import validator from "validator"; // --> Libreria que utilice para validar el campo email
import bcrypt from "bcrypt";

const VUELTAS = 10;

const usuarioSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: [true, "Campo obligatorio"],
        minlength: [3, "Nombre debe contener al menos 3 caracteres"],
        lowercase: true,
        trim: true
    },

    apellido: {
        type: String,
        required: [true, "Campo obligatorio"],
        minlength: [3, "Apellido debe contener al menos 3 caracteres"],
        lowercase: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: [true, "Campo obligatorio"],
        minlength: [7, "Email debe contener al menos 7 caracteres"],
        validate: [validator.isEmail, "Ingresa un correo electrónico válido"],
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: [true, "Campo obligatorio"],
        minlength: [8, "La contraseña debe contener al menos 8 caracteres"],
        select: false // --> para omitir la contraseña en consultas
    },

    telefono: {
        type: String,
        unique: true,
        required: [true, "Campo obligatorio"],
        minlength: [8, "El teléfono debe contener al menos 8 dígitos"],
        validate: [validator.isNumeric, "El campo solo debe contener números"],
        trim: true
    },

    rol: {
        type: String,
        required: [true, "Campo obligatorio"],
        enum: {
            values: ["admin", "socio"],
            message: "'{VALUE}' no es un rol válido"
        },
        default: "socio"
    },

}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
});

usuarioSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, VUELTAS);
});

usuarioSchema.methods.compararPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model("Usuario", usuarioSchema, "usuario");