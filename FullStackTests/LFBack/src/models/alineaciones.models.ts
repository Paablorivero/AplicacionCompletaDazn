import {CreationOptional, Model, DataTypes} from "sequelize";
import {sequelize} from '../configs/dbconnection.config';

class Alineacion extends Model{
    declare equipoId: string;
    declare jugadorId: number;
    declare jornadaId: number;
    declare puntuacion: number;
}

Alineacion.init(
    {
      equipoId: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          field: 'equipo_id'
      },

        jugadorId: {
          type: DataTypes.INTEGER,
            primaryKey: true,
            field: 'jugador_id',
            allowNull: false,
        },

        jornadaId: {
          type: DataTypes.INTEGER,
            primaryKey: true,
            field: 'jornada_id',
            allowNull: false,
        },

        puntuacion: {
          type: DataTypes.INTEGER,
            allowNull: false,
            field: 'puntuacion',
        },
    },
    {
        sequelize,
        modelName: "Alineacion",
        tableName: "alineaciones",
        timestamps: false,
    },
);

export default Alineacion;