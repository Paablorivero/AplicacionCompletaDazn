
// Esta es la ruta base para temas de registrarse o logearse. Los dos endpoints que puede usar son
/**
 * /login - Para logear un usuario
 * /register - Para registrarse
 */
export const authUrl: string = 'https://daznfntsy.up.railway.app/daznfntsy/auth';

// La siguiente ruta para los usuarios y los endpoints son
/**
 * /me - Perfil de Usuario
 * /me/update - Updatear el perfil de usuario
 * /username/:username - buscar usuario por su username (como param)
 * /all - obtener todos los usuarios, solo para el rol admin si nos da tiempo
 * /equipos/participacion - Un listado de los equipos de un usuario y las ligas en la que participan
 */

export const usersUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/users`;

// La siguiente ruta es la correspondiente para algunas operaciones de ligas. Sus endpoints son
/**
 * /all - Para obtener un listado de todas las ligas existentes
 * /disponibles - Para obtener un listado de las ligas que tienen plazas disponibles
 * /unirse/:ligaId - Para unirse a una liga ya creada. ligaId como Param
 * La dirección base sirve para crear una liga
 */
export const ligasUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/ligas`;


/**
 * Este es el endpoint base de alineaciones routes en el back. El endpoint que existe es el siguiente
 * /actual/:equipoId Nos proporciona un listado con la alineación actual de un equipo equipoId como param
 */
export const alineacionesUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/alineaciones`;

/**
 * Este es el endpoint base de plantillas routes en el back. El endpoint que existe es el siguiente
 * /actual/:equipoId/:jornadaId - Nos proporciona la plantilla actual de un equipo en una jornada concreta
 */
export const plantillasUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/plantillas`;

/**
 * Este va a ser la dirección base de temporadas. Lo vamos a usar para obtener la jornada actual de una temporada
 * /:temporadaId como param, por ahora solo va a existir una temporada. Así que con esto sacamos la jornada actual de liga
 */

export const temporadasUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/temporadas`;

/**
 * Endpoint base de equipos.
 * /mio/:ligaId devuelve el equipo del usuario autenticado en una liga.
 */
export const equiposUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/equipos`;

/**
 * Configuración administrativa sobre temporada y mercado.
 */
export const adminTemporadasUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/temporadas/admin`;

/**
 * Endpoint base de jugadores.
 */
export const jugadoresUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/jugadores`;

/**
 * Endpoint base de jornadas.
 */
export const jornadasUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/jornadas`;

/**
 * Proxy de noticias (NewsAPI no permite llamadas desde el navegador en producción).
 */
export const noticiasUrl: string = `https://daznfntsy.up.railway.app/daznfntsy/noticias`;
