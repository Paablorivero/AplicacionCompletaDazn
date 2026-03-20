import { Router } from "express";
import {
    getAllJornadas,
    getJornadaById,
    createJornada,
    updateJornada, getJornadaByFecha,
} from "../controllers/jornadas.controllers";
import {validateNumericParam} from "../middleware/validateNumericParam.middleware";
import {validateDatesInitEnd} from "../middleware/validateDatesInitEnd.middleware";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";

const routerJornadas: Router = Router();

routerJornadas.get("/jornadas", getAllJornadas);

routerJornadas.get("/jornadas/:jornadaId", validateNumericParam("jornadaId"), getJornadaById);

routerJornadas.post("/jornadas", adminAuthMiddleware, validateDatesInitEnd("fInicio", "fFin"), createJornada);

routerJornadas.put("/jornadas/update/:id", adminAuthMiddleware, validateNumericParam("id"), validateDatesInitEnd("fInicio", "fFin"), updateJornada);

routerJornadas.get("/jornadas/fecha/:fInicio", getJornadaByFecha);

export default routerJornadas;
