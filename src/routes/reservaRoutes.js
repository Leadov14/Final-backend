import { Router } from "express";
import * as reservaController from "../controllers/reservaController.js";
import { verificarToken } from "../middleware/verificarToken.js";

const router = Router();

router.post("/", verificarToken, reservaController.crear);

router.get("/", verificarToken, reservaController.listar);

router.get("/mis-reservas", verificarToken, reservaController.misReservas);

router.get("/:id", verificarToken, reservaController.obtenerId);

router.patch("/:id", verificarToken, reservaController.actualizar);

router.delete("/:id", verificarToken, reservaController.eliminar);

export default router;