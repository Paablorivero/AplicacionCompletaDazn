import { Request, Response, NextFunction } from 'express';

import Equipo from "../models/equipos.models";

export async function userTeamExistsInLiga(req: Request, res: Response, next: NextFunction) {

    const existe = await Equipo.findOne({
        where: {
            usuarioId: res.locals.jwtUser.sub,
            ligaId: req.params.ligaId
        }
    });

    if (existe) {
        return res.status(400).json({
            error:"Ya tienes un equipo en esta liga"
        });
    }

    next();
}