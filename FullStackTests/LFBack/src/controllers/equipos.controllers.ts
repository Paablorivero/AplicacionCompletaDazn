import {Request, Response} from "express";
import Equipo from "../models/equipos.models";
import Usuario from "../models/usuario.models";
import Liga from "../models/ligas.models";
import { sequelize } from "../configs/dbconnection.config";
import { sorteoInicial } from "../services/sorteoPlantilla.service";
import { crearAlineacionInicial } from "../services/crearAlineacionInicial.service";
import { asegurarJornadaExiste, obtenerTemporadaActiva } from "../services/jornadaActual.service";
import { asegurarPlantillaInicialCompleta } from "../services/asegurarPlantillaInicial.service";

const PRESUPUESTO_INICIAL_FICHAJES = 10_000_000;
const PRESUPUESTO_TECNICO_SORTEO = 100_000_000;


export async function registrarNuevoEquipoEnUnaLiga(req: Request, res: Response) {
    const ligaSeleccionada = res.locals.ligaId;
    const usuarioPropietario = res.locals.usuarioId;

    if(!ligaSeleccionada || typeof ligaSeleccionada !== "string") {
        return res.status(400).send({
            error: "Formato del código de liga no válido"
        });

    }

    if(!usuarioPropietario || typeof usuarioPropietario !== "string") {
        return res.status(400).send({
            error: "Formato del código de usuario no válido"
        });

    }

    const transaction = await sequelize.transaction();

    try {
        const nuevoEquipo = await Equipo.create({
            nombre: req.body.nombre,
            logo: '',
            usuarioId: usuarioPropietario,
            ligaId: ligaSeleccionada,
            presupuesto: PRESUPUESTO_TECNICO_SORTEO
        }, { transaction });

        const temporadaActiva = await obtenerTemporadaActiva(transaction);
        await asegurarJornadaExiste(temporadaActiva.temporadaId, temporadaActiva.jornadaActual, transaction);

        await sorteoInicial(ligaSeleccionada, nuevoEquipo.equipoId, temporadaActiva.jornadaActual, transaction);
        await asegurarPlantillaInicialCompleta(ligaSeleccionada, nuevoEquipo.equipoId, temporadaActiva.jornadaActual, transaction);
        await crearAlineacionInicial(nuevoEquipo.equipoId, temporadaActiva.jornadaActual, transaction);

        nuevoEquipo.setDataValue("presupuesto", PRESUPUESTO_INICIAL_FICHAJES);
        await nuevoEquipo.save({ transaction });

        await transaction.commit();
        res.status(201).send(nuevoEquipo);
    } catch (error) {
        await transaction.rollback();
        const detail = error instanceof Error ? error.message : "Error desconocido";
        return res.status(400).json({
            error: detail
        });
    }
}

export async function getAllEquiposLiga(req: Request, res: Response) {
    const ligaSeleccionada = req.params.ligaId;

    if(!ligaSeleccionada || typeof ligaSeleccionada !== "string") {
        return res.status(400).send({
            error: 'Formato del código de liga no es válido'
        });

    }

    const listadoEquiposLiga = await Equipo.findAll({where: {ligaId: ligaSeleccionada}});

    res.status(200).send(listadoEquiposLiga);
}

export async function getAllEquiposByUsuario(req: Request, res: Response) {
    const usuarioSeleccionado = req.params.usuarioId;

    if (!usuarioSeleccionado || typeof usuarioSeleccionado !== "string") {
        return res.status(400).json({ error: 'Debe proporcionarse un código de usuario válido' });
    }

    try {
        const listadoEquiposPorUsuario = await Equipo.findAll({
            where: { usuarioId: usuarioSeleccionado },
            include: [
                { model: Usuario, attributes: ['username'] },
                { model: Liga, attributes: ['nombreLiga'] }
            ]
        });

        res.status(200).json(listadoEquiposPorUsuario);
    } catch (error) {
        console.error('Error Sequelize:', error);
        res.status(500).json({ error: 'Error al obtener los equipos' });
    }
}

export async function getEquipoPropioEnLiga(req: Request, res: Response) {
    const ligaId = res.locals.ligaId ?? req.params.ligaId;
    const usuarioId = res.locals.jwtUser?.sub;

    if (!ligaId || typeof ligaId !== "string") {
        return res.status(400).json({ error: 'Debe proporcionarse una liga válida' });
    }

    if (!usuarioId || typeof usuarioId !== "string") {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    try {
        const equipo = await Equipo.findOne({
            where: { ligaId, usuarioId },
            attributes: ['equipoId', 'nombre', 'logo', 'usuarioId', 'ligaId', 'presupuesto']
        });

        if (!equipo) {
            return res.status(404).json({ error: 'No tienes equipo en esta liga' });
        }

        return res.status(200).json(equipo);
    } catch (error) {
        console.error('Error obteniendo equipo del usuario en liga:', error);
        return res.status(500).json({ error: 'Error al obtener el equipo en la liga' });
    }
}
