import {Request, Response, NextFunction} from 'express';


export const validateStringParams = (params: string[]) =>{
    return (req: Request, res: Response, next: NextFunction) => {

        for(const param of params){
            const valor = req.params[param];

            console.log(`He llegado hasta aquí ${valor}`);

            if(!valor ||
                typeof valor !== 'string' ||
                valor === "" ||
                valor.trim() === ""){

                return res.status(400).json({
                    error: `El valor de ${param} no es correcto`
                });
            }else{
                res.locals[param] = valor;
            }
        }

        next();
    }
}