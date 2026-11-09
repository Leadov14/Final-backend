import express from 'express';
import cors from 'cors';
import {conectarDB} from "./src/config/db.js"
import { PORT } from './src/utils/config.js';
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import canchaRoutes from "./src/routes/canchaRoutes.js";
import reservaRoutes from "./src/routes/reservaRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { manejarErrores } from './src/middleware/manejarErrores.js';

await conectarDB()

const app = express ()

app.use(cors())
app.use (express.json())

app.get('/', (req, res) => {
    res.send('Proyecto final de Backend. CRUD para alquiler de canchas');
});

app.use ("/api/usuarios", usuarioRoutes);
app.use ("/api/canchas", canchaRoutes);
app.use ("/api/reservas", reservaRoutes);
app.use("/api/auth", authRoutes);

app.use ( (req, res) => {
    res.status(404).json({error:'Esa direccion no existe'})
})

app.use(manejarErrores);

app.listen (PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})