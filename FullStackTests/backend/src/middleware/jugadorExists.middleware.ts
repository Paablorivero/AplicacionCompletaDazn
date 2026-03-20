import {Request, Response, NextFunction} from "express";

import Jugador from "../models/jugadores.model";

export const jugadorExists = async (req: Request, res: Response, next: NextFunction) => {
    const jugador = await Jugador.findByPk(res.locals.jugadorId);

    if (!jugador) {
        return res.status(404).json({
            error: "No existe el jugador buscado"
        });
    }

    res.locals.jugador = jugador;

    next();
}