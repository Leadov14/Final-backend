import { Router } from "express";
import * as canchaController from "../controllers/canchaController.js"
import { verificarToken } from "../middleware/verificarToken.js";
import { permitirRoles } from "../middleware/permitirRoles.js";

const router = Router();

router.post("/", verificarToken, permitirRoles("admin"), canchaController.crear);

router.get("/", canchaController.listar);

router.get("/:id", canchaController.obtenerId);

router.patch("/:id", verificarToken, permitirRoles("admin"), canchaController.actualizar);

router.delete("/:id", verificarToken, permitirRoles("admin"), canchaController.eliminar);

export default router;