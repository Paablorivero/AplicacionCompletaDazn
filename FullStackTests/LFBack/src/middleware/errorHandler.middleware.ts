import {Request, Response, NextFunction} from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const status = Number(err?.status) || 500;
    const message = typeof err?.message === "string" && err.message.trim().length > 0
        ? err.message
        : "Error interno del servidor";

    res.status(status).json({
        error: message
    });
}