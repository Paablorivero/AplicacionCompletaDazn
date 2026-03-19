import {Request, Response, NextFunction} from 'express';

export const fechaValidate = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log("He entrado al middleware fecha");
        const fecha = req.body.fechaNacimiento;

        const valorFecha = new Date(fecha);

        if(isNaN(valorFecha.getTime())){
            return res.status(400).json({
                error: `El valor de ${fecha} no es un valor correcto`
            });
        }

        if(valorFecha > new Date()){
            return res.status(400).json({
                error: `El valor ${ fecha } es un valor incorrecto`
            });
        }

        // Ahora con res.locals lo que hago es poder obtener para el controller el valor de la fecha ya validado y parseado
        res.locals.fechaNacimiento = valorFecha;

        next();
    }
}