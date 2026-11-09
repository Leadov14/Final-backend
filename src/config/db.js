import mongoose from "mongoose";
import { MONGO_URI } from "../utils/config.js";

export const conectarDB = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log(`Conectado a la base de datos ${mongoose.connection.name} correctamente.`);
    } catch (error) {
        console.error(`¡No fue posible conectarse a la base de datos! ${error.message}`)
        process.exit(1)
    }
}