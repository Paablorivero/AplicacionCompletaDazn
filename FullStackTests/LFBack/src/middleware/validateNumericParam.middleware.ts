import { Request, Response, NextFunction } from "express";

export const validateNumericParam = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const valor = Number(req.params[paramName]);

        if (isNaN(valor)) {
            return res.status(400).json({
                error: `El valor ${req.params[paramName]} no es un identificador correcto`
            });
        }

        // Guardamos el valor ya parseado
        res.locals[paramName] = valor;
        next();
    };
};
