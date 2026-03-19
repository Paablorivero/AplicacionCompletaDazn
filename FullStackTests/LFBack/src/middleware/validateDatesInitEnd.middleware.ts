import {Request, Response, NextFunction} from 'express';

export const validateDatesInitEnd = (inicio: string, fin: string) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const fechaI = new Date(req.body[inicio]);
        const fechaF = new Date(req.body[fin]);

        if(isNaN(fechaI.getTime()) || isNaN(fechaF.getTime())) {
            return res.status(400).json({
                error: `Formatos de fechas incorrectos`
            });
        }

        if(fechaF <= fechaI){
            return res.status(400).json({
                error: `La fecha de fin debe de ser posterior a la fecha de inicio`
            })
        }

        next();
    }
}