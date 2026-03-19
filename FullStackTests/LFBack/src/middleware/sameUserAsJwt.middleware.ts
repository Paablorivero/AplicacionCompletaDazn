import { Request, Response, NextFunction } from "express";

/**
 * Verifica que el usuario objetivo de la ruta coincide con el usuario autenticado.
 * Se usa para mantener compatibilidad con rutas legacy que reciben :usuarioId.
 */
export function sameUserAsJwt(paramName: string = "usuarioId") {
    return (req: Request, res: Response, next: NextFunction) => {
        const paramUserId = res.locals[paramName];
        const jwtUserId = res.locals.jwtUser?.sub;

        if (!paramUserId || !jwtUserId || paramUserId !== jwtUserId) {
            return res.status(403).json({
                error: "No tienes permisos para operar sobre otro usuario"
            });
        }

        next();
    };
}
