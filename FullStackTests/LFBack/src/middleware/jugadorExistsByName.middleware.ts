import { Request, Response, NextFunction } from "express";
import Jugador from "../models/jugadores.model";

export function jugadorExistsByName(param: string) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const valor = req.body[param];

        if (!valor || typeof valor !== "string") {
            return res.status(400).json({
                error: "Nombre de jugador inválido"
            });
        }

        const jugador = await Jugador.findOne({
            where: { nombre: valor }
        });

        if (!jugador) {
            return res.status(404).json({
                error: `No existe un jugador con el nombre ${valor}`
            });
        }

        res.locals.jugador = jugador;

        next();
    };
}
