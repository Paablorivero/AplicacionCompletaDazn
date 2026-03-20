import {CreationOptional, Model, DataTypes} from "sequelize";
import {sequelize} from "../configs/dbconnection.config";

class Temporada extends Model{
    declare temporadaId: CreationOptional<number>;
    declare fInicio: Date;
    declare fFin: Date;
    declare jornadaActual: number;
}

Temporada.init(
    {
        temporadaId:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'temporada_id'
        },

        fInicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'f_inicio'
        },

        fFin: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'f_fin'
        },

        jornadaActual: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'jornada_actual'
        },

    },

    {
        sequelize,
        modelName: "Temporada",
        tableName: "temporadas",
        timestamps: false,
    }
);

export default Temporada;