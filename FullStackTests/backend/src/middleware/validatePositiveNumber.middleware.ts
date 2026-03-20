import {Request, Response, NextFunction} from 'express';

export const validatePositiveNumber = (field: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const valor = Number(req.body[field]);

        if(isNaN(valor) || valor < 0) {
            return res.status(400).json({
                error: `El campo ${field} debe de ser un número positivo`
            });
        }

        next();
    }
}