import  {sequelize}  from "../configs/dbconnection.config";
import Liga from "../models/ligas.models";
import Equipo from "../models/equipos.models";
import {sorteoInicial} from "./sorteoPlantilla.service";
import {crearAlineacionInicial} from "./crearAlineacionInicial.service";
import {asegurarJornadaExiste, obtenerTemporadaActiva} from "./jornadaActual.service";
import { asegurarPlantillaInicialCompleta } from "./asegurarPlantillaInicial.service";

const PRESUPUESTO_INICIAL_FICHAJES = 10_000_000;
const PRESUPUESTO_TECNICO_SORTEO = 100_000_000;

export async function unirseLigaConEquipo(data:{
    nombreEquipo: string;
    usuarioId: string;
    logo?: string;
    ligaId: string;
}){

    const transaction = await sequelize.transaction();

    try{
        const equipo = await Equipo.create({
            nombre: data.nombreEquipo,
            logo: data.logo ?? null,
            usuarioId: data.usuarioId,
            ligaId: data.ligaId,
            // Presupuesto temporal para evitar negativos durante el sorteo inicial.
            presupuesto: PRESUPUESTO_TECNICO_SORTEO,
        }, {transaction: transaction});

        const temporadaActiva = await obtenerTemporadaActiva(transaction);
        await asegurarJornadaExiste(temporadaActiva.temporadaId, temporadaActiva.jornadaActual, transaction);

        await sorteoInicial(equipo.ligaId, equipo.equipoId, temporadaActiva.jornadaActual, transaction);
        await asegurarPlantillaInicialCompleta(equipo.ligaId, equipo.equipoId, temporadaActiva.jornadaActual, transaction);

        await crearAlineacionInicial(equipo.equipoId, temporadaActiva.jornadaActual, transaction);

        // Presupuesto real de inicio de mercado para el juego.
        equipo.setDataValue("presupuesto", PRESUPUESTO_INICIAL_FICHAJES);
        await equipo.save({ transaction });

        await transaction.commit();

        return {equipo};

    }catch(error){
        await transaction.rollback();
        throw error;
    }
}