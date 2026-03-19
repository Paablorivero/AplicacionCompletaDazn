// Este middleware estaba pensado para validar la existencia de un usuario en BD a la hora de hacer operaciones en BD.
// Como en pasos anteriores se habían almacenado el uuid en res.locals se obtenía de allí.

// Una vez he incluido JWT, podría simplemente reescribir este middleware, pero he preferido crear el basado en JWT desde cero
// y dejar este aquí como prueba de que un día prestó servicio

import {Request, Response, NextFunction} from 'express';

import Usuario from "../../models/usuario.models";

export const existsUsuario = async (req: Request, res: Response, next: NextFunction) => {
    const usuario = await Usuario.findByPk(res.locals.usuarioId);

    if (!usuario) {
        return res.status(404).json({
            error: 'El usuario buscado no existe'
        });
    }

    res.locals.usuario = usuario;
    next();
}
