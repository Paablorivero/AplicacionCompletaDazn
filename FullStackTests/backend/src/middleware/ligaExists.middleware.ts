import {Request, Response, NextFunction} from "express";

import Liga from "../models/ligas.models";

export const ligaExists = async (req: Request, res: Response, next: NextFunction) => {

    const ligaId = res.locals.ligaId;
    console.log('Ha llegado hasta la liga ' + ligaId);

    const liga = await Liga.findByPk(ligaId);

    if(!liga){
        return res.status(404).json({
            error: "No hay liga existente"
        });

    }

    res.locals.liga = liga;

    next();
}