import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/registro", authController.registrar);
router.post("/login", authController.login);

export default router;