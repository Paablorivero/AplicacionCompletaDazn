import {Request, Response, NextFunction} from "express";

export const emptyFields = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Primero probé con forEach, pero no rompe el bucle ni la petición cuando encuentra un error.

        for(const field of fields){
            // Recorro el array y por cada field lo que hago es que obtenga el valor de ese mismo field
            const valor = req.body[field];
            // Por cada field hago una serie de validaciones, de no ser correcto, debo de romper el bucle
            if(valor === undefined ||
                valor === null ||
                typeof valor !== 'string' ||
                valor === "" ||
                valor.trim() ===""
            ){
                // Cuando no es válido devuelve una respuesta
                return res.status(400).json({
                    error: `El campo ${field} no tiene valor o su formato es incorrecto`
                });
            }
        }
        // Si todo va bien salta al siguiente middleware
        next();
    };
};