import { Transaction } from "sequelize";
import { QueryTypes } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";
import Temporada from "../models/temporadas.models";

export async function obtenerJornadaActual(transaction?: Transaction): Promise<number> {
    const temporada = await Temporada.findOne({
        order: [["temporadaId", "DESC"]],
        transaction
    });

    return temporada?.jornadaActual ?? 1;
}

export async function obtenerTemporadaActiva(transaction?: Transaction): Promise<{
    temporadaId: number;
    jornadaActual: number;
}> {
    let temporada = await Temporada.findOne({
        order: [["temporadaId", "DESC"]],
        transaction
    });

    if (!temporada) {
        const hoy = new Date();
        const fin = new Date(hoy);
        fin.setFullYear(fin.getFullYear() + 1);

        temporada = await Temporada.create({
            fInicio: hoy,
            fFin: fin,
            jornadaActual: 1
        }, { transaction });
    }

    return {
        temporadaId: temporada.temporadaId,
        jornadaActual: temporada.jornadaActual
    };
}

export async function asegurarJornadaExiste(
    temporadaId: number,
    jornadaId: number,
    transaction?: Transaction
): Promise<void> {
    await sequelize.query(
        `INSERT INTO jornadas (jornada_id, f_inicio, f_fin, temporada_id)
         VALUES (:jornadaId, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', :temporadaId)
         ON CONFLICT (jornada_id) DO NOTHING`,
        {
            replacements: {
                jornadaId,
                temporadaId
            },
            type: QueryTypes.INSERT,
            transaction
        }
    );
}
