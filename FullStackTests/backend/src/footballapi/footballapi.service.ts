import Jugador from "../models/jugadores.model";
import EquipoProfesional from "../models/equiposProfesionales.models";

export async function getPlayersFromApi() {
    try {
        console.log("Intentando cargar jugadores desde api-sports.io...");
        await getPlayersFromApiSports();
        const total = await Jugador.count();
        if (total > 0) {
            console.log(`api-sports.io: ${total} jugadores cargados`);
            return;
        }
        console.log("api-sports.io devolvio 0 jugadores, probando fallback...");
    } catch (error) {
        console.error("api-sports.io fallo:", error instanceof Error ? error.message : error);
    }

    try {
        console.log("Cargando jugadores desde TheSportsDB (fallback)...");
        await getPlayersFromTheSportsDB();
        const total = await Jugador.count();
        console.log(`TheSportsDB: ${total} jugadores cargados`);
    } catch (error) {
        console.error("TheSportsDB tambien fallo:", error instanceof Error ? error.message : error);
        throw new Error("No se pudieron cargar jugadores de ninguna API");
    }
}

// ─── API-SPORTS.IO (principal) ───

async function getPlayersFromApiSports() {
    const temporada = 2025;
    const liga = 140;
    const totalPaginas = 37;

    for (let i = 1; i <= totalPaginas; i++) {
        const res = await fetch(
            `https://v3.football.api-sports.io/players?season=${temporada}&league=${liga}&page=${i}`,
            { headers: { 'x-apisports-key': process.env.API_TOKEN as string } }
        );

        if (!res.ok) {
            throw new Error(`Pagina ${i} status ${res.status}`);
        }

        const data = await res.json();

        if (!data.response || data.response.length === 0) {
            if (i === 1) throw new Error("API devolvio respuesta vacia en pagina 1");
            break;
        }

        await upsertPlayersFromApiSports(data.response);

        if (i % 10 === 0 || i === totalPaginas) {
            console.log(`  api-sports pagina ${i}/${totalPaginas}`);
        }
    }
}

function normalizePosition(pos: string | null): string | null {
    if (!pos) return null;

    const map: Record<string, string> = {
        "Goalkeeper": "Goalkeeper",
        "Defender": "Defender",
        "Midfielder": "Midfielder",
        "Attacker": "Attacker",
        "Forward": "Attacker",
    };

    return map[pos] ?? null;
}

async function upsertPlayersFromApiSports(players: any[]) {
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
        .filter((e): e is { equipoId: number; nombre: string; logo: string } => e !== null);

    const jugadoresMapeados = players.map(p => {
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
            posicion: normalizePosition(stats?.games?.position ?? null)
        };
    });

    const equiposUnicos = Object.values(
        Object.fromEntries(equiposMapeados.map(e => [e.equipoId, e]))
    );

    await EquipoProfesional.bulkCreate(equiposUnicos, {
        updateOnDuplicate: ['nombre', 'logo']
    });

    await Jugador.bulkCreate(jugadoresMapeados, {
        updateOnDuplicate: ['lesionado', 'foto', 'equipoProfesional', 'posicion']
    });
}

// ─── THESPORTSDB (fallback gratuito, sin API key) ───

const THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

function normalizeTheSportsDBPosition(pos: string | null): string | null {
    if (!pos) return null;

    const lower = pos.toLowerCase();

    if (lower.includes("goalkeeper") || lower.includes("keeper")) return "Goalkeeper";

    if (lower.includes("back") || lower.includes("defen")) return "Defender";

    if (lower.includes("midfield") || lower.includes("wing") || lower === "pivot") return "Midfielder";

    if (lower.includes("forward") || lower.includes("striker") || lower.includes("attacker")) return "Attacker";

    if (lower.includes("winger")) return "Attacker";

    return null;
}

async function getPlayersFromTheSportsDB() {
    const teamsRes = await fetch(
        `${THESPORTSDB_BASE}/search_all_teams.php?l=Spanish%20La%20Liga`
    );

    if (!teamsRes.ok) {
        throw new Error(`Error obteniendo equipos: ${teamsRes.status}`);
    }

    const teamsData = await teamsRes.json();
    const teams: any[] = teamsData.teams ?? [];

    if (teams.length === 0) {
        throw new Error("No se encontraron equipos de La Liga");
    }

    console.log(`  TheSportsDB: ${teams.length} equipos encontrados`);

    let totalJugadores = 0;

    for (const team of teams) {
        const teamId = Number(team.idTeam);
        const teamName = team.strTeam ?? "Desconocido";
        const teamLogo = team.strBadge ?? "";

        await EquipoProfesional.upsert({
            equipoId: teamId,
            nombre: teamName,
            logo: teamLogo
        });

        try {
            const playersRes = await fetch(
                `${THESPORTSDB_BASE}/lookup_all_players.php?id=${teamId}`
            );

            if (!playersRes.ok) continue;

            const playersData = await playersRes.json();
            const players: any[] = playersData.player ?? [];

            const jugadores = players.map(p => ({
                jugadorId: Number(p.idPlayer),
                nombre: p.strPlayer ?? "Desconocido",
                firstName: p.strPlayer?.split(" ")[0] ?? null,
                lastName: p.strPlayer?.split(" ").slice(1).join(" ") ?? null,
                fechaNacimiento: p.dateBorn ?? null,
                nacionalidad: p.strNationality ?? null,
                lesionado: false,
                foto: p.strCutout || p.strThumb || null,
                equipoProfesional: teamId,
                posicion: normalizeTheSportsDBPosition(p.strPosition)
            })).filter(j => j.posicion !== null);

            if (jugadores.length > 0) {
                await Jugador.bulkCreate(jugadores, {
                    updateOnDuplicate: ['nombre', 'lesionado', 'foto', 'equipoProfesional', 'posicion']
                });
                totalJugadores += jugadores.length;
            }

            // Rate limiting: pequeña pausa entre llamadas
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
            console.error(`  Error cargando jugadores de ${teamName}:`, err instanceof Error ? err.message : err);
        }
    }

    if (totalJugadores === 0) {
        throw new Error("TheSportsDB no devolvio jugadores validos");
    }

    console.log(`  TheSportsDB: ${totalJugadores} jugadores insertados de ${teams.length} equipos`);
}
