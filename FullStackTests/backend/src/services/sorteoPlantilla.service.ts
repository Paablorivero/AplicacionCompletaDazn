import { QueryTypes } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";

const POSICIONES_SORTEO: { posicion: string; cantidad: number }[] = [
    { posicion: "Goalkeeper", cantidad: 2 },
    { posicion: "Defender",   cantidad: 5 },
    { posicion: "Midfielder", cantidad: 4 },
    { posicion: "Attacker",   cantidad: 3 },
];

export async function sorteoInicial(
    ligaId: string,
    equipoId: string,
    jornada: number,
    transaction: any
) {
    for (const { posicion, cantidad } of POSICIONES_SORTEO) {
        await sequelize.query(
            `INSERT INTO plantillas (equipo_uuid, liga_id, jugador_pro, jornada_inicio, precio_compra)
             SELECT :equipoId, :ligaId, j.jugador_id, :jornada, j.valor
             FROM jugadores j
             WHERE j.posicion = :posicion
               AND NOT EXISTS (
                   SELECT 1
                   FROM plantillas p
                   WHERE p.liga_id = :ligaId
                     AND p.jugador_pro = j.jugador_id
                     AND p.jornada_fin IS NULL
               )
             ORDER BY RANDOM()
             LIMIT :cantidad`,
            {
                replacements: { equipoId, ligaId, jornada, posicion, cantidad },
                type: QueryTypes.INSERT,
                transaction,
            }
        );
    }
}