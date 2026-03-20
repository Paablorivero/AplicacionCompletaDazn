import Usuario from "./usuario.models";
import Liga from "./ligas.models";
import Equipo from "./equipos.models";
import Jornada from "./jornadas.models";
import Temporada from "./temporadas.models";
import Alineacion from "./alineaciones.models";
import Jugador from "./jugadores.model";
import Plantilla from "./plantillas.models";
import EquipoProfesional from "./equiposProfesionales.models";

// En este archivo vamos a tener simplemente las asociaciones que existen entre las diferentes entidades
// Una vez hecho, simplemente debemos importar y llamar a esta función en app.ts

export function relationsModels(){
    Usuario.hasMany(Liga, {foreignKey: "usuarioId"});
    Liga.belongsTo(Usuario, {foreignKey: 'usuarioId'});

    Usuario.hasMany(Equipo, {foreignKey: 'usuarioId'});
    Equipo.belongsTo(Usuario, {foreignKey: 'usuarioId'});

    Liga.hasMany(Equipo, {foreignKey: 'ligaId'});
    Equipo.belongsTo(Liga, {foreignKey: 'ligaId'});

    Temporada.hasMany(Jornada, {foreignKey: 'temporadaId'});
    Jornada.belongsTo(Temporada, {foreignKey: 'temporadaId'});

    Equipo.hasMany(Alineacion, {foreignKey: 'equipoId'});
    Jornada.hasMany(Alineacion, {foreignKey: 'jornadaId'});
    Jugador.hasMany(Alineacion, {foreignKey: 'jugadorId'});

    Alineacion.belongsTo(Jornada, {foreignKey: 'jornadaId'});
    Alineacion.belongsTo(Equipo, {foreignKey: 'equipoId'});
    Alineacion.belongsTo(Jugador, {foreignKey: 'jugadorId'});

    Equipo.hasMany(Plantilla, { foreignKey: "equipoUuid" });
    Plantilla.belongsTo(Equipo, { foreignKey: "equipoUuid" });

    Jugador.hasMany(Plantilla, { foreignKey: "jugadorPro" });
    Plantilla.belongsTo(Jugador, { foreignKey: "jugadorPro" });

    Liga.hasMany(Plantilla, { foreignKey: "ligaId" });
    Plantilla.belongsTo(Liga, { foreignKey: "ligaId" });

    Liga.belongsToMany(Usuario, {
        through: Equipo,
        foreignKey: "ligaId",
        otherKey: "usuarioId"
    });

    EquipoProfesional.hasMany(Jugador, { foreignKey: "equipoProfesional" });
    Jugador.belongsTo(EquipoProfesional, { foreignKey: "equipoProfesional" });
}