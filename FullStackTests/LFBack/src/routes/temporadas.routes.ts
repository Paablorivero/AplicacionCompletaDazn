import {
    actualizarMercadoAdmin,
    getAllTemporadas,
    getTemporadaActivaPublic,
    getTemporadaByFecha,
    getTemporadaById,
    createTemporada,
    estadoJornadaAdmin,
    historialJornadasAdmin,
    finalizarJornadaAdmin,
    iniciarJornadaAdmin
} from "../controllers/temporadas.controllers";
import {Router} from "express";
import {validateDatesInitEnd} from "../middleware/validateDatesInitEnd.middleware";
import {validateNumericParam} from "../middleware/validateNumericParam.middleware";
import {validateStringParams} from "../middleware/validateStringParams.middleware";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";

const routerTemporadas: Router = Router();

// routerTemporadas.post("/temporadas/create", validateDatesInitEnd("fInicio", "fFin"), createTemporada);

routerTemporadas.get("/temporadas/actual", getTemporadaActivaPublic);
routerTemporadas.get("/temporadas/:temporadaId", validateNumericParam("temporadaId"), getTemporadaById);

routerTemporadas.get("/temporadas/admin/jornada/estado", adminAuthMiddleware, estadoJornadaAdmin);
routerTemporadas.get("/temporadas/admin/jornada/historial", adminAuthMiddleware, historialJornadasAdmin);
routerTemporadas.post("/temporadas/admin/jornada/iniciar", adminAuthMiddleware, iniciarJornadaAdmin);
routerTemporadas.post("/temporadas/admin/jornada/finalizar", adminAuthMiddleware, finalizarJornadaAdmin);

routerTemporadas.post("/temporadas/admin/actualizar-mercado", adminAuthMiddleware, actualizarMercadoAdmin);

// routerTemporadas.get("/temporadas/fecha/:fInicio", validateStringParams(["fInicio"]), getTemporadaByFecha);

// routerTemporadas.get("/temporadas/get",getAllTemporadas);

export default routerTemporadas;