import {Request, Response, NextFunction} from 'express';

import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
//     Por partes. Lo primero hay que obtener el header de la peticion que es donde se manda el token
    const authHeader = req.headers.authorization;

//     Ahora hay que checkear que haya un parámetro authorization en el header, si no, res.status(401) que es Unauthorized
    if (!authHeader) {
        return res.status(401).json({
            error: 'No se ha proporcionado token firmado de autorización'
        });
    }

//     Debo de extraer el token del header para checkear que exista y que sea correcto
    const [type, token] = authHeader.split(' ');

//     Valido. Si el tipo es distinto de Bearer o no hay token, devuelvo otra vez 401
    if(type !== 'Bearer' || !token){
        return res.status(401).json({
            // Que el mensaje sea distinto del anterior, así puedo saber que da fallo exactamente en pruebas
            error: 'Formato incorrecto del token firmado de autorizacion'
        });
    }

//     Como en este proceso puede haber errores lo envolvemos todo en un try-catch. El error suele ser no tener SECRET
//     en .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({
            error: "Configuración de autenticación no disponible"
        });
    }

    try{

    //     Hay que verificar el token y su firma. Si ponía solo process.env.JWT_SECRET daba error porque puede ser null
    //     con ! le dices a ts que se fie de ti. Mala elección TS.
        const decoded = jwt.verify(token, secret);

    //     Hasta ahora yo he trabajado con res.locals. Por el momento voy a seguir así para no tocar demasiadas cosas
    //     que dan pie a meter la pata.

        res.locals.jwtUser = decoded;
        // Si llega hasta aquí todo correcto, que pase al siguiente middleware
        next();
    }catch(e){
        res.status(401).json({
            error: 'Token inválido'
        })
    }
}