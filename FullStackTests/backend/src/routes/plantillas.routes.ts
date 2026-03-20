import { Router } from "express";
import { obtenerPlantillaActual, obtenerPlantillaActiva } from "../controllers/plantillas.controllers";
import { validateStringParams } from "../middleware/validateStringParams.middleware";
import { validateNumericParam } from "../middleware/validateNumericParam.middleware";

const routerPlantillas = Router();

routerPlantillas.get(
    "/plantillas/actual/:equipoId/:jornadaId",
    validateStringParams(["equipoId"]),
    validateNumericParam("jornadaId"),
    obtenerPlantillaActual
);

routerPlantillas.get(
    "/plantillas/activa/:equipoId",
    validateStringParams(["equipoId"]),
    obtenerPlantillaActiva
);

export default routerPlantillas;
