import Jugador from "../models/jugadores.model";
import EquipoProfesional from "../models/equiposProfesionales.models";

export async function getPlayersFromApi(){
    const temporada: number = 2025;
    const liga: number = 140;
    const totalPaginas: number = 37;

        for (let i = 1; i <= totalPaginas; i++) {
            let listadoJugadores = await fetch(`https://v3.football.api-sports.io/players?season=${temporada}&league=${liga}&page=${i}`, {
                method: "GET",
                headers: {
                    'x-apisports-key': process.env.API_TOKEN as string
                }
            });

            if (!listadoJugadores.ok) {
                throw new Error(`No se encontro el jugadores. Error ${listadoJugadores.status}`);
            }

            let data = await listadoJugadores.json();

            await createOrUpdatePlayers(data.response);

        }

}

function normalizePosition(pos: string | null) {
    if (!pos) return null;

    if (pos === "Forward") return "Attacker";

    const allowed = [
        "Goalkeeper",
        "Defender",
        "Midfielder",
        "Attacker"
    ];

    return allowed.includes(pos) ? pos : null;
}

async function createOrUpdatePlayers(players: any[]) {

    const equiposMapeados = players
        .map(p => {
            const stats = p.statistics?.at(-1);
            if (!stats?.team) return null;

            return {
                equipoId: stats.team.id,
                nombre: stats.team.name,
                logo: stats.team.logo
            };
        })
        .filter((e): e is {
            equipoId: number;
            nombre: string;
            logo: string;
        } => e !== null);

    let jugadoresMapeados = players.map(p => {

        const stats = p.statistics?.at(-1);

        return {
            jugadorId: p.player.id,
            nombre: p.player.name,
            firstName: p.player.firstname,
            lastName: p.player.lastname,

            fechaNacimiento: p.player.birth?.date ?? null,

            nacionalidad: p.player.nationality,
            lesionado: p.player.injured,
            foto: p.player.photo,

            equipoProfesional: stats?.team?.id ?? null,
            posicion: normalizePosition(
                stats?.games?.position ?? null
            )
        };
    });

    const equiposUnicos = Object.values(
        Object.fromEntries(
            equiposMapeados.map(e => [e.equipoId, e])
        )
    );

    await EquipoProfesional.bulkCreate(equiposUnicos, {
        updateOnDuplicate: ['nombre','logo']
    });

    await Jugador.bulkCreate(jugadoresMapeados, {
        updateOnDuplicate: [
            'lesionado',
            'foto',
            'equipoProfesional',
            'posicion'
        ],
    });
}