import { Request, Response } from "express";
import Jornada from "../models/jornadas.models";

export const getAllJornadas = async (req: Request, res: Response) => {
    try {
        const jornadas = await Jornada.findAll();
        res.json(jornadas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener jornadas" });
    }
};


export const getJornadaById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.jornadaId);

        if (isNaN(id)) {
            return res.status(400).json({ message: "El id debe ser numérico" });
        }

        const jornada = await Jornada.findByPk(id);

        if (!jornada) {
            return res.status(404).json({ message: "Jornada no encontrada" });
        }

        res.json(jornada);

    } catch (error) {
        res.status(500).json({ message: "Error al obtener la jornada" });
    }
};


export const createJornada = async (req: Request, res: Response) => {
    try {
        const { fInicio, fFin, temporadaId } = req.body;

        if (isNaN(Number(temporadaId))) {
            return res.status(400).json({ message: "temporadaId debe ser numérico" });
        }

        const nuevaJornada = await Jornada.create({
            fInicio,
            fFin,
            temporadaId: Number(temporadaId)
        });

        res.status(201).json(nuevaJornada);

    } catch (error) {
        res.status(500).json({ message: "Error al crear jornada" });
    }
};

export async function getJornadaByFecha(req: Request, res: Response) {
    try{

        const fInicio = req.params.fInicio;

        const listadoJornada = await Jornada.findAll({where: {fInicio}});

        if (listadoJornada.length === 0) {
            return res.status(404).json({ message: "Jornada no encontrada"
            });
        }
    res.status(200).json(listadoJornada);

    }catch(error){
        res.status(500).json({ message: "Error al obtener jornada" });
    }
}

export const updateJornada = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "El id debe ser numérico" });
        }

        const { fInicio, fFin, temporadaId } = req.body;

        if (temporadaId && isNaN(Number(temporadaId))) {
            return res.status(400).json({ message: "temporadaId debe ser numérico" });
        }

        const jornada = await Jornada.findByPk(id);

        if (!jornada) {
            return res.status(404).json({ message: "Jornada no encontrada" });
        }

        await jornada.update({
            fInicio,
            fFin,
            temporadaId: temporadaId ? Number(temporadaId) : jornada.temporadaId
        });

        res.json(jornada);

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar jornada" });
    }
};

