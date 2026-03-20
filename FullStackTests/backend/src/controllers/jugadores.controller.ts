import Jugador from "../models/jugadores.model";
import { Request, Response } from "express";
import Equipo from "../models/equipos.models";
import { QueryTypes } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";
import EquipoProfesional from "../models/equiposProfesionales.models";


export async function getAllJugadores(req: Request, res: Response) {
    const ligaId = typeof req.query.ligaId === "string" ? req.query.ligaId : null;

    const listadoJugadores = await sequelize.query(
        `SELECT
            j.jugador_id AS "jugadorId",
            j.nombre AS "nombre",
            j.first_name AS "firstName",
            j.last_name AS "lastName",
            j.fecha_nacimiento AS "fechaNacimiento",
            j.nacionalidad AS "nacionalidad",
            j.lesionado AS "lesionado",
            j.foto AS "foto",
            j.equipo_profesional_id AS "equipoProfesionalId",
            j.posicion AS "posicion",
            j.valor AS "valor",
            COALESCE(ep.nombre, 'Sin equipo profesional') AS "equipoProfesionalNombre",
            ep.logo AS "equipoProfesionalLogo",
            CASE WHEN j.equipo_profesional_id IS NULL THEN false ELSE true END AS "tieneEquipoProfesional",
            CASE WHEN pl.equipo_uuid IS NULL THEN false ELSE true END AS "tieneEquipoEnLiga",
            eq_liga.nombre AS "equipoLigaNombre"
        FROM jugadores j
        LEFT JOIN equipos_profesionales ep
          ON ep.equipo_id = j.equipo_profesional_id
        LEFT JOIN LATERAL (
            SELECT p.equipo_uuid
            FROM plantillas p
            WHERE p.jugador_pro = j.jugador_id
              AND p.jornada_fin IS NULL
              AND (:ligaId::uuid IS NOT NULL AND p.liga_id = :ligaId::uuid)
            LIMIT 1
        ) pl ON true
        LEFT JOIN equipos eq_liga
          ON eq_liga.equipo_id = pl.equipo_uuid
        ORDER BY j.nombre ASC`,
        {
            type: QueryTypes.SELECT,
            replacements: { ligaId }
        }
    );

    res.status(200).json(listadoJugadores);
}

export async function getJugadorByJugadorId(req: Request, res: Response) {
    const idJugador = res.locals.jugadorId;

    const existeJugador = await Jugador.findOne({where: {jugadorId: idJugador}});

    if(!existeJugador){
        return res.status(404).json({
            error: 'El jugador buscado no existe'
        });

    }

    res.status(200).json(existeJugador);
}

export async function getAllJugadoresByTeam(req: Request, res: Response) {
    const idEquipo = res.locals.equipoProfesional;

    const existeEquipo = await EquipoProfesional.findByPk(idEquipo);

    if(!existeEquipo){
        return res.status(404).json({
            error: 'No existe un equipo identificado por la id solicitada'
        });

    }

    const listadoJugadoresPorEquipo = await Jugador.findAll({where: {equipoProfesional: idEquipo}});

    res.status(200).json(listadoJugadoresPorEquipo);
}