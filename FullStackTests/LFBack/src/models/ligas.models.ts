import {CreationOptional, DataTypes, Model, Sequelize} from "sequelize";
import {sequelize} from "../configs/dbconnection.config";
import Equipo from "./equipos.models";
import Usuario from "./usuario.models";

class Liga extends Model {
    declare ligaId: CreationOptional<string>;
    declare nombreLiga: string;
    declare usuarioId: string;
}

Liga.init(
    {
        ligaId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            field: 'liga_id'
        },

        nombreLiga: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'nombre_liga'
        },

        usuarioId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'usuario_id'
        },
    },

    {
        sequelize,
        modelName: "Liga",
        tableName: "ligas",
        timestamps: false,
    }
);


export default Liga;