import {Request, Response, NextFunction} from 'express';

import Equipo from "../models/equipos.models"

export function equipoExistsByName(param: string){
    return async (req: Request, res: Response, next: NextFunction) => {
        const valor = res.locals[param];

        if(!valor){
            res.status(400).send({
                error: `El campo ${param} debe de tener un valor`
            });
        }

        const equipo = await Equipo.findOne({where: {nombre: valor}});

        if(!equipo){
            res.status(404).json({
                error: `No se ha encontrado un equipo con el nombre ${valor}`
            });
        }

        res.locals.equipo = equipo;

        next();
    }
}