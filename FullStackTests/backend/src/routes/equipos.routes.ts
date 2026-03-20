import {Router} from 'express';
import {
    getAllEquiposByUsuario,
    getAllEquiposLiga,
    getEquipoPropioEnLiga,
    registrarNuevoEquipoEnUnaLiga
} from "../controllers/equipos.controllers";
import {validateStringParams} from "../middleware/validateStringParams.middleware";
import {ligaPlazasLibres} from "../middleware/ligaPlazasLibres.middleware";
import {existsUsuario} from "../middleware/legacy/userExistence.middleware";
import { sameUserAsJwt } from "../middleware/sameUserAsJwt.middleware";

const routerEquipos: Router = Router();

routerEquipos.post(
    '/equipos/crear/:ligaId/:usuarioId',
    validateStringParams(["ligaId", "usuarioId"]),
    sameUserAsJwt("usuarioId"),
    ligaPlazasLibres,
    existsUsuario,
    registrarNuevoEquipoEnUnaLiga
);

routerEquipos.get('/equipos/getAll/:ligaId', validateStringParams(["ligaId"]), getAllEquiposLiga);

routerEquipos.get('/equipos/getAll/usuario/:usuarioId', validateStringParams(["usuarioId"]), existsUsuario, getAllEquiposByUsuario);

routerEquipos.get('/equipos/mio/:ligaId', validateStringParams(["ligaId"]), getEquipoPropioEnLiga);

export default routerEquipos;