import { QueryTypes } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";

export async function sorteoInicial(
    ligaId:string,
    equipoId:string,
    jornada:number,
    transaction:any
){

    await sequelize.query(
        `
      SELECT sorteo_inicial_equipo(
         :ligaId,
         :equipoId,
         :jornada
      )
      `,
        {
            replacements:{
                ligaId,
                equipoId,
                jornada
            },
            type: QueryTypes.SELECT,
            transaction
        }
    );
}