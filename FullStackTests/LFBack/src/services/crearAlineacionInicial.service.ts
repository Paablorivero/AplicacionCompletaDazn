import { Transaction } from "sequelize";

import Plantilla from "../models/plantillas.models";
import Jugador from "../models/jugadores.model";
import Alineacion from "../models/alineaciones.models";

export async function crearAlineacionInicial(equipoId: string, jornadaId: number, transaction?: Transaction){

    //Compruebo que no existe una alineación por si acaso
    const existe = await Alineacion.findOne({
       where:{
           equipoId,
           jornadaId
       },
        transaction
    });

    // Si ya existe una alineación se retorna, no hay que hacer nada
    if(existe){
        return;
    }

//     Ahora debo de obtener la plantilla disponible de ese equipo
    const plantilla = await Plantilla.findAll({
        where:{
            equipoUuid: equipoId,
            jornadaFin: null
        },
        order: [
            ["jornadaInicio", "ASC"],
            ["jugadorPro", "ASC"]
        ],
        include:[
            {
                model:Jugador,
                attributes:["jugadorId", "posicion"]
            }
        ],
        transaction
    });

    if(plantilla.length === 0){
        throw new Error("El equipo no tiene plantilla activa");
    }

    //Como el resultado es encontrar todas las plantillas y dentro de ellas hay que sacar los jugadores debo mapear el
//     resultado
    const jugadores = plantilla.map((p:any) => p.Jugador).filter(Boolean);

//     Formación inicial fija 4-3-3.
//     Para esta parte voy a usar el spread operator de los arrays de JavaScript para ir creando un nuevo arrayList a partir de los
//     filter necesarios
    const seleccionados = [
        ...jugadores.filter(j => j.posicion === "Goalkeeper").slice(0,1),
        ...jugadores.filter(j => j.posicion === "Defender").slice(0,4),
        ...jugadores.filter(j => j.posicion === "Midfielder").slice(0,3),
        ...jugadores.filter(j => j.posicion === "Attacker").slice(0,3),
    ];

    if(seleccionados.length !== 11){
        throw new Error("No existen jugadores suficientes para formar una plantilla");
    }

//     Inserto el resultado final en la tabla alineaciones
    await Alineacion.bulkCreate(
        seleccionados.map(j => ({
            equipoId,
            jugadorId: j.jugadorId,
            jornadaId,
            puntuacion: 0
        })),
        { transaction }
    );
}