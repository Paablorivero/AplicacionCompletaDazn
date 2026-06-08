import {Request, Response, NextFunction} from "express";
import { applyCorsHeaders } from "../configs/cors.config";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const status = Number(err?.status) || 500;
    const message = typeof err?.message === "string" && err.message.trim().length > 0
        ? err.message
        : "Error interno del servidor";

    applyCorsHeaders(req, res);

    res.status(status).json({
        error: message
    });
}