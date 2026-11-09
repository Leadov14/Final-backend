import { Router } from "express";
import * as usuarioController from "../controllers/usuarioController.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { permitirRoles } from "../middleware/permitirRoles.js";

const router = Router();

router.post("/", verificarToken, permitirRoles("admin"), usuarioController.crear);

router.get("/", verificarToken, permitirRoles("admin"), usuarioController.listar);

router.get("/:id", verificarToken, usuarioController.obtenerId);

router.patch("/:id", verificarToken, usuarioController.actualizar);

router.delete("/:id", verificarToken, usuarioController.eliminar);

export default router;