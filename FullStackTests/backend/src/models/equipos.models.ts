import {CreationOptional, DataTypes, Model} from "sequelize";
import {sequelize} from "../configs/dbconnection.config";
import Usuario from "./usuario.models";

class Equipo extends Model{
    declare equipoId: CreationOptional<string>;
    declare nombre: string;
    declare logo: string;
    declare usuarioId: string;
    declare ligaId: string;
    declare presupuesto: number;
}

Equipo.init(
    {
        equipoId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            field: 'equipo_id'
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'nombre'
        },

        logo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'logo'
        },

        usuarioId:{
            type: DataTypes.UUID,
            allowNull: false,
            field: 'usuario_id'
        },

        ligaId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'liga_id',
                references: {
                    model: 'ligas',
                    key: 'liga_id'
                }
        },

        presupuesto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10000000,
            field: 'presupuesto'
        }
},
    {
        sequelize,
        modelName: "Equipo",
        tableName: "equipos",
        timestamps: false,
    }
);


export default Equipo;