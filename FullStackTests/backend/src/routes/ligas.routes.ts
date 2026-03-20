import {Router} from 'express';
import {
    clasificacionLiga,
    comprarJugadorMercado,
    venderJugadorMercado,
    mercadoVersion,
    mercadoLiga,
    obtenerListadoDeLigas,
    obtenerListadoLigasConPlazasDisponibles, participantesLiga,
    registrarLigaPorUnUsuario, unirseALiga
} from "../controllers/ligas.controllers";
import {validateStringParams} from "../middleware/validateStringParams.middleware";
import {emptyFields} from "../middleware/emptyFields.middleware";
import {ligaExists} from "../middleware/ligaExists.middleware";
import {ligaPlazasLibres} from "../middleware/ligaPlazasLibres.middleware";
import {userTeamExistsInLiga} from "../middleware/userTeamExistsInLiga.middleware";


const routerLigas: Router = Router();


/**
 * @swagger
 * /ligas/all:
 *   get:
 *     summary: Obtener listado completo de ligas
 *     tags: [Ligas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de ligas obtenido correctamente
 */
routerLigas.get("/ligas/all", obtenerListadoDeLigas);

/**
 * @swagger
 * /ligas/disponibles:
 *   get:
 *     summary: Obtener ligas con plazas disponibles
 *     tags: [Ligas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de ligas con plazas libres
 */
routerLigas.get("/ligas/disponibles", obtenerListadoLigasConPlazasDisponibles);

/**
 * @swagger
 * /ligas:
 *   post:
 *     summary: Crear una nueva liga y el equipo inicial del usuario
 *     tags: [Ligas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreLiga
 *               - nombreEquipo
 *             properties:
 *               nombreLiga:
 *                 type: string
 *               nombreEquipo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Liga y equipo creados correctamente
 *       400:
 *         description: Datos inválidos
 */
routerLigas.post(
    "/ligas", emptyFields(["nombreLiga", "nombreEquipo"]), registrarLigaPorUnUsuario);

/**
 * @swagger
 * /ligas/unirse/{ligaId}:
 *   post:
 *     summary: Unirse a una liga creando un equipo con sorteo inicial
 *     tags: [Ligas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ligaId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la liga
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreEquipo
 *             properties:
 *               nombreEquipo:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario unido correctamente a la liga
 *       400:
 *         description: Liga completa o usuario ya tiene equipo
 *       404:
 *         description: Liga no encontrada
 */
routerLigas.post(
    "/ligas/unirse/:ligaId",
    emptyFields(["nombreEquipo"]),
    validateStringParams(["ligaId"]),
    ligaExists,
    ligaPlazasLibres,
    userTeamExistsInLiga,
    unirseALiga
);

/**
 * @swagger
 * /ligas/{ligaId}/clasificacion:
 *   get:
 *     summary: Obtener clasificación de una liga
 *     tags: [Ligas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ligaId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la liga
 *     responses:
 *       200:
 *         description: Clasificación obtenida correctamente
 *       404:
 *         description: Liga no encontrada
 */
routerLigas.get("/ligas/:ligaId/clasificacion", validateStringParams(["ligaId"]), ligaExists, clasificacionLiga);

/**
 * @swagger
 * /ligas/{ligaId}/participantes:
 *   get:
 *     summary: Obtener listado de participantes de una liga
 *     tags: [Ligas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ligaId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la liga
 *     responses:
 *       200:
 *         description: Participantes obtenidos correctamente
 *       404:
 *         description: Liga no encontrada
 */
routerLigas.get("/ligas/:ligaId/participantes", validateStringParams(["ligaId"]), ligaExists, participantesLiga);

routerLigas.get("/ligas/:ligaId/mercado", validateStringParams(["ligaId"]), ligaExists, mercadoLiga);
routerLigas.get("/ligas/:ligaId/mercado/version", validateStringParams(["ligaId"]), ligaExists, mercadoVersion);
routerLigas.post("/ligas/:ligaId/mercado/comprar", validateStringParams(["ligaId"]), ligaExists, comprarJugadorMercado);
routerLigas.post("/ligas/:ligaId/mercado/vender", validateStringParams(["ligaId"]), ligaExists, venderJugadorMercado);

export default routerLigas;