import {Request, Response, NextFunction} from 'express';

import Liga from "../models/ligas.models";
import Equipo from "../models/equipos.models";

export const ligaPlazasLibres = async(req: Request, res: Response, next: NextFunction) => {

    const ligaId = res.locals.ligaId;

    const numEquipos = await Equipo.count({
        where: {ligaId}
    });

    if(numEquipos >= 20){
        return res.status(400).json({
            error: `La liga ya ha alcanzado el máximo de equipos`
        });
    }

    next();
}