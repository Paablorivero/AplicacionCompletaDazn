import { Router } from "express";
import { registrarNuevoUsuario, loginUsuario } from "../controllers/usuarios.controller";
import { emptyFields } from "../middleware/emptyFields.middleware";
import { fechaValidate } from "../middleware/fechaValidate.middleware";

const routerAuth = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - fechaNacimiento
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos
 */
routerAuth.post(
    "/auth/register",
    emptyFields(["username","email","password","fechaNacimiento"]),
    fechaValidate(),
    registrarNuevoUsuario
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Devuelve JWT
 */
routerAuth.post(
    "/auth/login",
    emptyFields(["username","password"]),
    loginUsuario
);

export default routerAuth;