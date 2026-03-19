import {Request, Response} from "express";
import Temporada from "../models/temporadas.models"
import { QueryTypes, Transaction } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";
import { incrementarVersionMercado } from "../services/mercadoVersion.service";

const TOTAL_JORNADAS_TEMPORADA = 38;

type EstadoJornadaRow = { jornada_iniciada: boolean };
type HistorialJornadaRow = { jornadaId: number; fInicio: string | null; fFin: string | null };

async function asegurarTablaEstadoJornada(): Promise<void> {
    await sequelize.query(
        `CREATE TABLE IF NOT EXISTS admin_estado_jornada (
            id integer PRIMARY KEY DEFAULT 1,
            jornada_iniciada boolean NOT NULL DEFAULT false,
            CONSTRAINT single_row CHECK (id = 1)
        )`
    );

    await sequelize.query(
        `INSERT INTO admin_estado_jornada (id, jornada_iniciada)
         VALUES (1, false)
         ON CONFLICT (id) DO NOTHING`
    );
}

async function asegurarTablaHistorialJornadas(): Promise<void> {
    await sequelize.query(
        `CREATE TABLE IF NOT EXISTS admin_historial_jornadas (
            jornada_id integer PRIMARY KEY,
            f_inicio timestamptz null,
            f_fin timestamptz null
        )`
    );
}

async function obtenerEstadoJornadaActual(): Promise<boolean> {
    await asegurarTablaEstadoJornada();
    const estado = await sequelize.query<EstadoJornadaRow>(
        `SELECT jornada_iniciada
         FROM admin_estado_jornada
         WHERE id = 1`,
        { type: QueryTypes.SELECT }
    );
    return Boolean(estado[0]?.jornada_iniciada);
}

async function obtenerTemporadaActiva() {
    return Temporada.findOne({
        order: [['temporadaId', 'DESC']]
    });
}

async function obtenerMaxJornada(): Promise<number> {
    return TOTAL_JORNADAS_TEMPORADA;
}

function resolverFechaEvento(input: unknown): Date {
    if (typeof input === "string") {
        const parsed = new Date(input);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    return new Date();
}

function sumarUnDia(fecha: Date): Date {
    const copy = new Date(fecha);
    copy.setDate(copy.getDate() + 1);
    return copy;
}

async function guardarInicioJornada(
    temporadaId: number,
    jornadaActual: number,
    fechaInicio: Date,
    transaction?: Transaction
): Promise<void> {
    const finProvisional = sumarUnDia(fechaInicio);
    await sequelize.query(
        `INSERT INTO jornadas (jornada_id, f_inicio, f_fin, temporada_id)
         VALUES (:jornadaActual, :fechaInicio, :finProvisional, :temporadaId)
         ON CONFLICT (jornada_id)
         DO UPDATE SET
            f_inicio = EXCLUDED.f_inicio,
            f_fin = EXCLUDED.f_fin,
            temporada_id = EXCLUDED.temporada_id`,
        {
            replacements: {
                jornadaActual,
                fechaInicio,
                finProvisional,
                temporadaId
            },
            transaction
        }
    );
}

async function registrarInicioHistorial(
    jornadaActual: number,
    fechaInicio: Date,
    transaction?: Transaction
): Promise<void> {
    await asegurarTablaHistorialJornadas();
    await sequelize.query(
        `INSERT INTO admin_historial_jornadas (jornada_id, f_inicio)
         VALUES (:jornadaActual, :fechaInicio)
         ON CONFLICT (jornada_id)
         DO UPDATE SET f_inicio = EXCLUDED.f_inicio`,
        {
            replacements: {
                jornadaActual,
                fechaInicio
            },
            transaction
        }
    );
}

async function guardarFinJornada(
    jornadaActual: number,
    fechaFin: Date,
    transaction?: Transaction
): Promise<void> {
    const finAjustado = sumarUnDia(fechaFin);
    await sequelize.query(
        `UPDATE jornadas
         SET f_fin = :fechaFin
         WHERE jornada_id = :jornadaActual`,
        {
            replacements: {
                jornadaActual,
                fechaFin: finAjustado
            },
            transaction
        }
    );
}

async function registrarFinHistorial(
    jornadaActual: number,
    fechaFin: Date,
    transaction?: Transaction
): Promise<void> {
    await asegurarTablaHistorialJornadas();
    await sequelize.query(
        `INSERT INTO admin_historial_jornadas (jornada_id, f_fin)
         VALUES (:jornadaActual, :fechaFin)
         ON CONFLICT (jornada_id)
         DO UPDATE SET f_fin = EXCLUDED.f_fin`,
        {
            replacements: {
                jornadaActual,
                fechaFin
            },
            transaction
        }
    );
}

async function recalcularMercado(transaction?: Transaction): Promise<number> {
    const [actualizados] = await sequelize.query(
        `UPDATE jugadores
         SET valor = 1000000
         WHERE posicion IS NOT NULL
         RETURNING jugador_id`,
        transaction ? { raw: true, transaction } : { raw: true }
    );
    await incrementarVersionMercado(transaction);
    return Array.isArray(actualizados) ? (actualizados as unknown[]).length : 0;
}

export async function getAllTemporadas(req: Request, res: Response) {
    try {
        const listadoTemporadas = await Temporada.findAll();

        if (listadoTemporadas.length === 0) {
            return res.status(200).json({
                error: 'No se han encontrado registros de temporadas'
            });
        }
        res.status(200).json(listadoTemporadas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener jornada" });
    }

}

export async function getTemporadaByFecha(req: Request, res: Response) {
    const fecha:string | string[] = req.params.fInicio;

    const listadoTemporadasFecha = await Temporada.findAll({where: {fInicio: fecha}});

    if (!listadoTemporadasFecha) {
        return res.status(200).json({
            error: 'No se ha encontrado una temporada que corresponda a esta fecha'
        });
    }

    res.status(200).json(listadoTemporadasFecha);
}

export async function getTemporadaById(req: Request, res: Response) {
    const id = Number(req.params.temporadaId);

    if(!id || Number.isNaN(id)) {
        return res.status(400).json({
            error: 'Mal formato de la temporadaId para realizar la peticion'
        });
    }

    const temporada = await Temporada.findByPk(id);

    if (!temporada) {
        return res.status(404).json({
            error: 'No se ha devuelto ningún resultado que coincida con la búsqueda'
        });
    }
    return res.status(200).json(temporada);

}

export async function getTemporadaActivaPublic(req: Request, res: Response) {
    try {
        const temporada = await Temporada.findOne({
            order: [["temporadaId", "DESC"]]
        });

        if (!temporada) {
            return res.status(404).json({
                error: "No existe una temporada configurada"
            });
        }

        return res.status(200).json(temporada);
    } catch (error) {
        return res.status(500).json({
            error: "Error al obtener la temporada activa"
        });
    }
}

export async function createTemporada(req: Request, res: Response) {

    try {
        const {fInicio, fFin} = req.body;

        if (!fFin || !fInicio || typeof fFin !== 'string' || typeof fInicio !== 'string') {
            return res.status(400).json({
                error: 'Formato de los datos de la petición inocrreta'
            });
        }

        const fechaI = new Date(fInicio);
        const fechaF = new Date(fFin);

        if (fechaF <= fechaI) {
            return res.status(400).json({
                error: 'La fecha de fin no puede ser anterior a la fecha Inicio'
            });
        }

        const nuevaTemporada = await Temporada.create({
            fInicio: fechaI,
            fFin: fechaF
        });

        res.status(200).json(nuevaTemporada);
    } catch (error) {
        res.status(500).json({message: "Error al insertar temporada " + error});
    }

}

export async function estadoJornadaAdmin(req: Request, res: Response) {
    try {
        const temporada = await obtenerTemporadaActiva();

        if (!temporada) {
            return res.status(404).json({ error: 'No existe una temporada configurada' });
        }

        const iniciada = await obtenerEstadoJornadaActual();
        const maxJornada = await obtenerMaxJornada();

        return res.status(200).json({
            ok: true,
            jornadaActual: temporada.jornadaActual,
            jornadaIniciada: iniciada,
            maxJornada
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener el estado de jornada' });
    }
}

export async function historialJornadasAdmin(req: Request, res: Response) {
    try {
        await asegurarTablaHistorialJornadas();
        const historial = await sequelize.query<HistorialJornadaRow>(
            `SELECT
                jornada_id AS "jornadaId",
                f_inicio AS "fInicio",
                f_fin AS "fFin"
             FROM admin_historial_jornadas
             WHERE f_inicio IS NOT NULL OR f_fin IS NOT NULL
             ORDER BY jornada_id ASC`,
            { type: QueryTypes.SELECT }
        );

        return res.status(200).json(historial);
    } catch (error) {
        return res.status(500).json({ error: "No se pudo obtener el historial de jornadas" });
    }
}

export async function iniciarJornadaAdmin(req: Request, res: Response) {
    try {
        const temporada = await obtenerTemporadaActiva();
        if (!temporada) {
            return res.status(404).json({ error: 'No existe una temporada configurada' });
        }

        const iniciada = await obtenerEstadoJornadaActual();
        if (iniciada) {
            return res.status(400).json({ error: 'La jornada ya está iniciada' });
        }

        if (temporada.jornadaActual > TOTAL_JORNADAS_TEMPORADA) {
            temporada.jornadaActual = TOTAL_JORNADAS_TEMPORADA;
            await temporada.save();
        }

        const fechaEvento = resolverFechaEvento(req.body?.fechaEvento);
        await guardarInicioJornada(temporada.temporadaId, temporada.jornadaActual, fechaEvento);
        await registrarInicioHistorial(temporada.jornadaActual, fechaEvento);

        await sequelize.query(
            `UPDATE admin_estado_jornada
             SET jornada_iniciada = true
             WHERE id = 1`
        );

        return res.status(200).json({
            ok: true,
            jornadaIniciada: true,
            jornadaActual: temporada.jornadaActual
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al iniciar jornada' });
    }
}

export async function finalizarJornadaAdmin(req: Request, res: Response) {
    try {
        const temporada = await obtenerTemporadaActiva();
        if (!temporada) {
            return res.status(404).json({ error: 'No existe una temporada configurada' });
        }

        const iniciada = await obtenerEstadoJornadaActual();
        if (!iniciada) {
            return res.status(400).json({ error: 'La jornada ya está finalizada' });
        }

        const maxJornada = await obtenerMaxJornada();
        if (temporada.jornadaActual > maxJornada) {
            temporada.jornadaActual = maxJornada;
        }
        const siguienteJornada = Math.min(temporada.jornadaActual + 1, maxJornada);
        const fechaEvento = resolverFechaEvento(req.body?.fechaEvento);

        let jugadoresActualizados = 0;
        await sequelize.transaction(async (transaction) => {
            await sequelize.query(
                `UPDATE admin_estado_jornada
                 SET jornada_iniciada = false
                 WHERE id = 1`,
                { transaction }
            );

            await guardarFinJornada(temporada.jornadaActual, fechaEvento, transaction);
            await registrarFinHistorial(temporada.jornadaActual, fechaEvento, transaction);

            temporada.jornadaActual = siguienteJornada;
            await temporada.save({ transaction });
            jugadoresActualizados = await recalcularMercado(transaction);
        });

        return res.status(200).json({
            ok: true,
            jornadaIniciada: false,
            jornadaActual: siguienteJornada,
            jugadoresActualizados
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al finalizar jornada' });
    }
}

export async function actualizarMercadoAdmin(req: Request, res: Response) {
    try {
        const jugadoresActualizados = await recalcularMercado();

        return res.status(200).json({
            ok: true,
            jugadoresActualizados
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al actualizar mercado' });
    }
}