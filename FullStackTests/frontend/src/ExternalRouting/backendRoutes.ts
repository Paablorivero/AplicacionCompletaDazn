const RAILWAY_API_BASE = 'https://daznfntsy.up.railway.app/daznfntsy';
const LOCAL_API_BASE = 'http://localhost:3000/daznfntsy';

function resolveApiBase(): string {
  if (typeof window === 'undefined') {
    return RAILWAY_API_BASE;
  }

  const host = window.location.hostname;

  if (host === 'localhost' || host === '127.0.0.1') {
    return LOCAL_API_BASE;
  }

  // En Vercel las peticiones van al proxy /api (mismo origen, sin CORS).
  return '/api';
}

const API_BASE = resolveApiBase();

// Esta es la ruta base para temas de registrarse o logearse. Los dos endpoints que puede usar son
/**
 * /login - Para logear un usuario
 * /register - Para registrarse
 */
export const authUrl: string = `${API_BASE}/auth`;

// La siguiente ruta para los usuarios y los endpoints son
/**
 * /me - Perfil de Usuario
 * /me/update - Updatear el perfil de usuario
 * /username/:username - buscar usuario por su username (como param)
 * /all - obtener todos los usuarios, solo para el rol admin si nos da tiempo
 * /equipos/participacion - Un listado de los equipos de un usuario y las ligas en la que participan
 */
export const usersUrl: string = `${API_BASE}/users`;

// La siguiente ruta es la correspondiente para algunas operaciones de ligas. Sus endpoints son
/**
 * /all - Para obtener un listado de todas las ligas existentes
 * /disponibles - Para obtener un listado de las ligas que tienen plazas disponibles
 * /unirse/:ligaId - Para unirse a una liga ya creada. ligaId como Param
 * La dirección base sirve para crear una liga
 */
export const ligasUrl: string = `${API_BASE}/ligas`;

/**
 * Este es el endpoint base de alineaciones routes en el back. El endpoint que existe es el siguiente
 * /actual/:equipoId Nos proporciona un listado con la alineación actual de un equipo equipoId como param
 */
export const alineacionesUrl: string = `${API_BASE}/alineaciones`;

/**
 * Este es el endpoint base de plantillas routes en el back. El endpoint que existe es el siguiente
 * /actual/:equipoId/:jornadaId - Nos proporciona la plantilla actual de un equipo en una jornada concreta
 */
export const plantillasUrl: string = `${API_BASE}/plantillas`;

/**
 * Este va a ser la dirección base de temporadas. Lo vamos a usar para obtener la jornada actual de una temporada
 * /:temporadaId como param, por ahora solo va a existir una temporada. Así que con esto sacamos la jornada actual de liga
 */
export const temporadasUrl: string = `${API_BASE}/temporadas`;

/**
 * Endpoint base de equipos.
 * /mio/:ligaId devuelve el equipo del usuario autenticado en una liga.
 */
export const equiposUrl: string = `${API_BASE}/equipos`;

/**
 * Configuración administrativa sobre temporada y mercado.
 */
export const adminTemporadasUrl: string = `${API_BASE}/temporadas/admin`;

/**
 * Endpoint base de jugadores.
 */
export const jugadoresUrl: string = `${API_BASE}/jugadores`;

/**
 * Endpoint base de jornadas.
 */
export const jornadasUrl: string = `${API_BASE}/jornadas`;

/**
 * Proxy de noticias (NewsAPI no permite llamadas desde el navegador en producción).
 */
export const noticiasUrl: string = `${API_BASE}/noticias`;
