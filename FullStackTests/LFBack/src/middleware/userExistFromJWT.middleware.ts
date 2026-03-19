import {Request, Response, NextFunction} from 'express';

import Usuario from "../models/usuario.models";

export async function userExistFromJWT(req: Request, res: Response, next: NextFunction) {
    const usuarioId = res.locals.jwtUser.sub;

    const usuario = await Usuario.findByPk(usuarioId, {
        attributes: ['usuarioId', 'username', 'email', 'rol', 'fechaNacimiento']
    });

    if (!usuario) {
        return res.status(404).json({
            error: "El usuario no existe"
        });
    }

    res.locals.usuario = usuario;

    next();
}