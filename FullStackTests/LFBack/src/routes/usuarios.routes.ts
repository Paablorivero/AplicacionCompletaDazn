import {Router} from "express";

import {
    modificarUsuario, obtenerEquiposDelUsuarioYLigas,
    obtenerTodosLosUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorNombreDeUsuario
} from "../controllers/usuarios.controller";

import {validateStringParams} from "../middleware/validateStringParams.middleware";
import {userExistFromJWT} from "../middleware/userExistFromJWT.middleware";
import {adminAuthMiddleware} from "../middleware/adminAuth.middleware";

const routerUsuarios: Router = Router();

// Estos dos primeros endpoints están aquí por ahora. Una vez se implemente JWT, deberán de moverse si es necesario
// Porque registrarse y login son los dos únicos endpoints, además de la ruta de home en el front que no deben de estar
// protegidos
// routerUsuarios.post(
//     '/users/register',
//     emptyFields(["username", "email", "password", "fechaNacimiento"]),
//     fechaValidate(),
//     registrarNuevoUsuario
// );
//
// routerUsuarios.post(
//     "/users/login",
//     emptyFields(["username","password"]),
//     loginUsuario
// );

// A partir de aquí, acciones de usuario normal.



/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       401:
 *         description: No autenticado
 */
routerUsuarios.get(
    '/users/me',
    userExistFromJWT,
    obtenerUsuarioPorId
);

/**
 * @swagger
 * /users/username/{username}:
 *   get:
 *     summary: Obtener un usuario por su nombre de usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario a buscar
 *     responses:
 *       200:
 *         description: Usuario encontrado correctamente
 *       404:
 *         description: No existe un usuario con ese nombre
 *       400:
 *         description: Parámetro inválido
 */
routerUsuarios.get(
    '/users/username/:username',
    validateStringParams(["username"]),
    obtenerUsuarioPorNombreDeUsuario
);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Obtener listado completo de usuarios (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de usuarios obtenido correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso solo para administradores
 */
routerUsuarios.get('/users/all', adminAuthMiddleware, obtenerTodosLosUsuarios);


/**
 * @swagger
 * /users/equipos/participacion:
 *   get:
 *     summary: Obtener equipos y ligas en las que participa el usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participaciones del usuario obtenidas correctamente
 *       401:
 *         description: Token inválido o usuario no autenticado
 *       404:
 *         description: Usuario no encontrado
 */
routerUsuarios.get('/users/equipos/participacion', userExistFromJWT, obtenerEquiposDelUsuarioYLigas);


/**
 * @swagger
 * /users/me/update:
 *   patch:
 *     summary: Modificar datos del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
routerUsuarios.patch('/users/me/update', userExistFromJWT, modificarUsuario);


export default routerUsuarios;