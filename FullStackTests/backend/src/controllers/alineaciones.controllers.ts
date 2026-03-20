import { Request, Response } from "express";
import Alineacion from "../models/alineaciones.models";
import Jugador from "../models/jugadores.model";
import EquipoProfesional from "../models/equiposProfesionales.models";
import {guardarAlineacion} from "../services/guardarAlineacion.service";

export async function obtenerAlineacionActual(req: Request, res: Response){

    const equipoId = req.params.equipoId;
    const jornadaId = req.params.jornadaId;

    try{

        const alineacion = await Alineacion.findAll({
            where:{
                equipoId,
                jornadaId: Number(jornadaId)
            },
            include:[
                {
                    model: Jugador,
                    as: "Jugador",
                    attributes:[
                        "jugadorId",
                        "nombre",
                        "posicion",
                        "foto",
                        "valor",
                        "nacionalidad"
                    ],
                    include: [
                        {
                            model: EquipoProfesional,
                            attributes: ["logo"]
                        }
                    ]
                }
            ]
        });

        if(alineacion.length === 0){
            return res.status(404).json({
                error:"No existe alineación para este equipo"
            });
        }

        const jugadores = alineacion.map((a: any) => {
            const j = a.Jugador;
            if (!j) return null;
            const { EquipoProfesional: ep, ...rest } = j.toJSON();
            return { ...rest, equipoProfesionalLogo: ep?.logo ?? null };
        }).filter(Boolean);

        return res.status(200).json(jugadores);

    }catch(e){
        console.log(e);
        return res.status(500).json({
            error:"Error obteniendo alineación"
        });
    }
}

export async function actualizarAlineacion(req: Request, res: Response){
    const equipoId = req.params.equipoId;
    const jornadaId = Number(req.params.jornadaId);
    const { jugadores } = req.body;

    if (!equipoId || typeof equipoId !== "string") {
        return res.status(400).json({
            error: "equipoId es obligatorio"
        });
    }

    if (!Number.isFinite(jornadaId)) {
        return res.status(400).json({
            error: "jornadaId debe ser numérico"
        });
    }

    if (!Array.isArray(jugadores)) {
        return res.status(400).json({
            error: "El campo jugadores debe ser un array de IDs"
        });
    }

    try {
        await guardarAlineacion(equipoId, jornadaId, jugadores);
        return res.status(200).json({message: "Alineación actualizada"});
    } catch (e) {
        const detail = e instanceof Error ? e.message : "Error desconocido";
        return res.status(400).json({
            error: detail
        });
    }
}