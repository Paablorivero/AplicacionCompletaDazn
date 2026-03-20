import { Router } from 'express';
import {getAllJugadores, getAllJugadoresByTeam, getJugadorByJugadorId} from "../controllers/jugadores.controller";
import {validateNumericParam} from "../middleware/validateNumericParam.middleware";

const routerJugadores: Router = Router();


routerJugadores.get("/jugadores/equipo/:equipoProfesional", validateNumericParam("equipoProfesional"), getAllJugadoresByTeam);

routerJugadores.get("/jugadores/:jugadorId", validateNumericParam("jugadorId"), getJugadorByJugadorId);

routerJugadores.get("/jugadores", getAllJugadores);

export default routerJugadores;

