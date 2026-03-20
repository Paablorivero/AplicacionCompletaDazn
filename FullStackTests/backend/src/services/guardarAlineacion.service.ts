import {sequelize} from "../configs/dbconnection.config";
import Alineacion from "../models/alineaciones.models";
import Plantilla from "../models/plantillas.models";
import Jugador from "../models/jugadores.model";
import { Op } from "sequelize";

export async function guardarAlineacion(equipoId: string, jornadaId: number, jugadores: number[]) {

    const t = await sequelize.transaction();

    try {
        const jugadoresNumericos = jugadores
            .filter((jugadorId) => Number.isInteger(jugadorId))
            .map((jugadorId) => Number(jugadorId));
        const jugadoresUnicos = Array.from(new Set(jugadoresNumericos));

        if (jugadoresUnicos.length !== 11) {
            throw new Error("La alineación debe tener exactamente 11 jugadores distintos");
        }

        const jugadoresPlantilla = await Plantilla.findAll({
            attributes: ["jugadorPro"],
            where: {
                equipoUuid: equipoId,
                jornadaInicio: { [Op.lte]: jornadaId },
                [Op.or]: [
                    { jornadaFin: null },
                    { jornadaFin: { [Op.gt]: jornadaId } }
                ]
            },
            transaction: t,
        });

        const permitidos = new Set<number>(jugadoresPlantilla.map((p: any) => Number(p.jugadorPro)));
        const fueraDePlantilla = jugadoresUnicos.filter((jugadorId) => !permitidos.has(jugadorId));
        if (fueraDePlantilla.length > 0) {
            throw new Error("Solo puedes alinear jugadores de tu plantilla activa");
        }

        const jugadoresSeleccionados = await Jugador.findAll({
            attributes: ["jugadorId", "posicion"],
            where: {
                jugadorId: jugadoresUnicos
            },
            transaction: t,
        });

        const conteoPosiciones = {
            Goalkeeper: 0,
            Defender: 0,
            Midfielder: 0,
            Attacker: 0,
        };

        for (const jugador of jugadoresSeleccionados as any[]) {
            const posicion = jugador.posicion as keyof typeof conteoPosiciones;
            if (!conteoPosiciones[posicion] && conteoPosiciones[posicion] !== 0) {
                continue;
            }
            conteoPosiciones[posicion] += 1;
        }

        if (
            conteoPosiciones.Goalkeeper !== 1 ||
            conteoPosiciones.Defender !== 4 ||
            conteoPosiciones.Midfielder !== 3 ||
            conteoPosiciones.Attacker !== 3
        ) {
            throw new Error("La alineación debe respetar la formación 4-3-3");
        }

        // Para no hacer updates de 1 en 1, porque además al cambiar la alineación no quiero hacer update de nada, si no
        // Actualizar todos su miembros, lo que debo de hacer es eliminarlos de la tabla, para luego insertar todo de golpe
        //la nueva alineación.
        await Alineacion.destroy({
            where: { equipoId, jornadaId },
            transaction: t
        });

        // Una vez he borrado la alineación vieja, debo de insertar los datos de la nueva, por lo tanto, de los datos que recibo
        //como parámetros, debo de mapear los jugadores y prepararlos para insertarlos de nuevo.
        const data = jugadoresUnicos.map(jugadorId => ({
            equipoId,
            jugadorId,
            jornadaId,
            puntuacion: 0
        }));

        // Inserto los nuevos registros en la tabla alineaciones.
        await Alineacion.bulkCreate(data, {
            transaction: t
        });

        await t.commit();

    } catch (e) {
        await t.rollback();
        throw e;
    }
}