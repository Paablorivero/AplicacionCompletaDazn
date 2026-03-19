import  {sequelize}  from "../configs/dbconnection.config";
import Liga from "../models/ligas.models";
import Equipo from "../models/equipos.models";
import {sorteoInicial} from "./sorteoPlantilla.service";
import {crearAlineacionInicial} from "./crearAlineacionInicial.service";
import {asegurarJornadaExiste, obtenerTemporadaActiva} from "./jornadaActual.service";
import { asegurarPlantillaInicialCompleta } from "./asegurarPlantillaInicial.service";

const PRESUPUESTO_INICIAL_FICHAJES = 10_000_000;
const PRESUPUESTO_TECNICO_SORTEO = 100_000_000;

// Este servicio está pensado para que la crear una liga, se cree también un equipo. Usa transactions. Pero la versión managed
// de sequelize. Eso, aunque posiblemente no nos hiciese falta para resolver bien el proyecto, se supone que nos protege de
// posibles errores por concurrencia, de la misma forma que el singleton de java. Si hay algún fallo, se hace el rollback cancelando
// las operaciones. La managed de sequelize es la que yo no tengo que llamar manualmente a las funciones de cancelar y hacer el rollbac,

export async function crearLigaConEquipo(data: {
    // Defino variables para almacenar los diferentes datos que deben de llegar.
    nombreLiga: string;
    nombreEquipo: string;
    usuarioId: string;
}) {

    // Defino una constante del tipo transaction.
    const transaction = await sequelize.transaction();

    try {

        // Aquí, creo la liga, con los datos correspondientes
        const liga = await Liga.create({
            nombreLiga: data.nombreLiga,
            usuarioId: data.usuarioId
        }, { transaction: transaction });

        // Aquí creo el equipo con los datos correspondientes
        const equipo = await Equipo.create({
            nombre: data.nombreEquipo,
            usuarioId: data.usuarioId,
            ligaId: liga.ligaId,
            // Presupuesto temporal para evitar negativos durante el sorteo inicial.
            presupuesto: PRESUPUESTO_TECNICO_SORTEO,
        }, { transaction: transaction });

        const temporadaActiva = await obtenerTemporadaActiva(transaction);
        await asegurarJornadaExiste(temporadaActiva.temporadaId, temporadaActiva.jornadaActual, transaction);

        // Aquí el sorteo de equipo inicial
        await sorteoInicial(liga.ligaId, equipo.equipoId, temporadaActiva.jornadaActual, transaction);
        await asegurarPlantillaInicialCompleta(liga.ligaId, equipo.equipoId, temporadaActiva.jornadaActual, transaction);

        // Una vez creado el servicio creo una alineación inicial
        await crearAlineacionInicial(equipo.equipoId, temporadaActiva.jornadaActual, transaction);

        // Presupuesto real de inicio de mercado para el juego.
        equipo.setDataValue("presupuesto", PRESUPUESTO_INICIAL_FICHAJES);
        await equipo.save({ transaction });

        // Aquí, se espera a que se haga el commit de la transaction.
        await transaction.commit();

        // Devuelvo la nueva liga y el nuevo equipo
        return { liga, equipo };

    //     Aquí la parte importante. Si por alguna razón hay un error. La operación se deshace.
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}