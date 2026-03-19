import {Model, CreationOptional, DataTypes} from "sequelize";
import {sequelize} from "../configs/dbconnection.config";

class Jornada extends Model {
    declare jornadaId: CreationOptional<number>;
    declare fInicio: Date;
    declare fFin: Date;
    declare temporadaId: number;
}

Jornada.init(
    {
        jornadaId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'jornada_id'
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

        temporadaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'temporada_id'
        },
    },

    {
        sequelize,
        modelName: "Jornada",
        tableName: "jornadas",
        timestamps: false,
    }
);

export default Jornada;