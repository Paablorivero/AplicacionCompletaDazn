import { QueryTypes, Transaction } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";

type Posicion = "Goalkeeper" | "Defender" | "Midfielder" | "Attacker";

const REQUERIDOS_POR_POSICION: Record<Posicion, number> = {
    Goalkeeper: 2,
    Defender: 5,
    Midfielder: 4,
    Attacker: 3
};

async function contarJugadoresActivosPorPosicion(
    ligaId: string,
    equipoId: string,
    posicion: Posicion,
    transaction?: Transaction
): Promise<number> {
    const rows = await sequelize.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
         FROM plantillas p
         JOIN jugadores j
           ON j.jugador_id = p.jugador_pro
         WHERE p.liga_id = :ligaId
           AND p.equipo_uuid = :equipoId
           AND p.jornada_fin IS NULL
           AND j.posicion = :posicion`,
        {
            replacements: { ligaId, equipoId, posicion },
            type: QueryTypes.SELECT,
            transaction
        }
    );

    return Number(rows[0]?.total ?? 0);
}

async function insertarJugadoresFaltantes(
    ligaId: string,
    equipoId: string,
    jornadaId: number,
    posicion: Posicion,
    faltan: number,
    transaction?: Transaction
): Promise<number> {
    if (faltan <= 0) {
        return 0;
    }

    const inserted = await sequelize.query<{ jugador_pro: number }>(
        `INSERT INTO plantillas (equipo_uuid, liga_id, jugador_pro, jornada_inicio, precio_compra)
         SELECT
           :equipoId,
           :ligaId,
           j.jugador_id,
           :jornadaId,
           j.valor
         FROM jugadores j
         WHERE j.posicion = :posicion
           AND NOT EXISTS (
             SELECT 1
             FROM plantillas p2
             WHERE p2.liga_id = :ligaId
               AND p2.jugador_pro = j.jugador_id
               AND p2.jornada_fin IS NULL
           )
         ORDER BY RANDOM()
         LIMIT :faltan
         RETURNING jugador_pro`,
        {
            replacements: {
                equipoId,
                ligaId,
                jornadaId,
                posicion,
                faltan
            },
            type: QueryTypes.SELECT,
            transaction
        }
    );

    return inserted.length;
}

async function recortarExcesoPorPosicion(
    ligaId: string,
    equipoId: string,
    jornadaId: number,
    posicion: Posicion,
    permitidos: number,
    transaction?: Transaction
): Promise<void> {
    const activos = await sequelize.query<{
        plantillaId: number;
        jornadaInicio: number;
        esTitular: boolean;
    }>(
        `SELECT
            p.plantilla_id AS "plantillaId",
            p.jornada_inicio AS "jornadaInicio",
            CASE WHEN a.jugador_id IS NULL THEN false ELSE true END AS "esTitular"
         FROM plantillas p
         JOIN jugadores j
           ON j.jugador_id = p.jugador_pro
         LEFT JOIN alineaciones a
           ON a.equipo_id = p.equipo_uuid
          AND a.jornada_id = :jornadaId
          AND a.jugador_id = p.jugador_pro
         WHERE p.liga_id = :ligaId
           AND p.equipo_uuid = :equipoId
           AND p.jornada_fin IS NULL
           AND j.posicion = :posicion
         ORDER BY
           CASE WHEN a.jugador_id IS NULL THEN 1 ELSE 0 END ASC,
           p.jornada_inicio ASC,
           p.plantilla_id ASC`,
        {
            replacements: { ligaId, equipoId, jornadaId, posicion },
            type: QueryTypes.SELECT,
            transaction
        }
    );

    if (activos.length <= permitidos) {
        return;
    }

    const sobrantes = activos.slice(permitidos);
    for (const jugador of sobrantes) {
        await sequelize.query(
            `UPDATE plantillas
             SET jornada_fin = GREATEST(:jornadaId, jornada_inicio + 1)
             WHERE plantilla_id = :plantillaId
               AND jornada_fin IS NULL`,
            {
                replacements: {
                    jornadaId,
                    plantillaId: jugador.plantillaId
                },
                type: QueryTypes.UPDATE,
                transaction
            }
        );
    }
}

export async function asegurarPlantillaInicialCompleta(
    ligaId: string,
    equipoId: string,
    jornadaId: number,
    transaction?: Transaction
): Promise<void> {
    const posiciones = Object.keys(REQUERIDOS_POR_POSICION) as Posicion[];

    for (const posicion of posiciones) {
        const requeridos = REQUERIDOS_POR_POSICION[posicion];
        const actuales = await contarJugadoresActivosPorPosicion(ligaId, equipoId, posicion, transaction);
        const faltan = requeridos - actuales;

        if (faltan > 0) {
            await insertarJugadoresFaltantes(ligaId, equipoId, jornadaId, posicion, faltan, transaction);
        }
    }

    for (const posicion of posiciones) {
        const permitidos = REQUERIDOS_POR_POSICION[posicion];
        await recortarExcesoPorPosicion(ligaId, equipoId, jornadaId, posicion, permitidos, transaction);
    }

    for (const posicion of posiciones) {
        const requeridos = REQUERIDOS_POR_POSICION[posicion];
        const actuales = await contarJugadoresActivosPorPosicion(ligaId, equipoId, posicion, transaction);

        if (actuales !== requeridos) {
            throw new Error(`No se pudo normalizar la posicion ${posicion} para la plantilla del equipo`);
        }
    }
}
