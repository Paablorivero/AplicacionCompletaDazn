import {Request, Response, NextFunction} from 'express';

import Equipo from "../models/equipos.models";

export async function equipoExists(req: Request, res: Response, next: NextFunction) {
    const equipo = await Equipo.findOne({where: {equipoId: res.locals.equipoId}});

    if (!equipo) {
        return res.status(404).json({
            error: `Equipo no encontrado`
        });
    }

    res.locals.equipo = equipo;

    next();
}