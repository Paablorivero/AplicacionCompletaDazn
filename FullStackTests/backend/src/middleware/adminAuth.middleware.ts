import { Request, Response, NextFunction } from "express";

export function adminAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const jwtUser = res.locals.jwtUser;

    if(!jwtUser || jwtUser.rol !== "admin"){
        return res.status(403).json({
            error: "Acceso denegado"
        });
    }

    next();
}