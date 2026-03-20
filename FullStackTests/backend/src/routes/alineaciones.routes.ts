import { Router } from "express";
import {actualizarAlineacion, obtenerAlineacionActual} from "../controllers/alineaciones.controllers";
import { validateStringParams } from "../middleware/validateStringParams.middleware";
import { equipoOwnership } from "../middleware/equipoOwnership.middleware";

const routerAlineaciones = Router();

routerAlineaciones.get(
    "/alineaciones/actual/:equipoId/:jornadaId",
    validateStringParams(["equipoId"]),
    obtenerAlineacionActual
);

routerAlineaciones.put(
    "/alineaciones/:equipoId/:jornadaId",
    validateStringParams(["equipoId"]),
    equipoOwnership,
    actualizarAlineacion
);

export default routerAlineaciones;