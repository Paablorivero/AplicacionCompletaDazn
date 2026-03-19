import { Request, Response, NextFunction } from "express";
import Equipo from "../models/equipos.models";

/**
 * Garantiza que el equipo indicado en ruta pertenece al usuario autenticado.
 * Evita que un usuario modifique alineaciones de equipos ajenos.
 */
export async function equipoOwnership(req: Request, res: Response, next: NextFunction) {
    const equipoId = res.locals.equipoId;
    const jwtUserId = res.locals.jwtUser?.sub;

    if (!equipoId || !jwtUserId) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    const equipo = await Equipo.findByPk(equipoId, {
        attributes: ["equipoId", "usuarioId"]
    });

    if (!equipo) {
        return res.status(404).json({
            error: "El equipo no existe"
        });
    }

    if (equipo.usuarioId !== jwtUserId) {
        return res.status(403).json({
            error: "No puedes modificar un equipo que no te pertenece"
        });
    }

    next();
}
