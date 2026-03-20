import { CreationOptional, DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";

class EquipoProfesional extends Model {
    declare equipoId: number;
    declare nombre: string;
    declare logo: string;
}

EquipoProfesional.init(
    {
        equipoId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "equipo_id",
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "nombre",
        },

        logo: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "logo",
        },
    },
    {
        sequelize,
        modelName: "EquipoProfesional",
        tableName: "equipos_profesionales",
        timestamps: false,
    }
);

export default EquipoProfesional;