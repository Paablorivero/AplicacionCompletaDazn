import {CreationOptional, Sequelize} from "sequelize";

import{Model, DataTypes} from "sequelize";
import {sequelize} from "../configs/dbconnection.config";

class Usuario extends Model{
    declare usuarioId: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare passwordHash: string;
    declare rol: string;
    declare fechaNacimiento: Date
}

Usuario.init(
    {
        usuarioId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            field: 'usuario_id',
        },

        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'username',
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'email',
        },

        passwordHash: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: 'password_hash',
        },

        rol:{
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user",
            field: 'rol',
        },

        fechaNacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'f_nacim',
        }
    },

    {
        sequelize,
        modelName: "Usuario",
        tableName: "usuarios",
        timestamps: false,
    }
);

export default Usuario;