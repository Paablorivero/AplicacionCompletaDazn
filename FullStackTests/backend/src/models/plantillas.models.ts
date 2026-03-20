import { Model, DataTypes, CreationOptional } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";

class Plantilla extends Model {
    declare plantillaId: CreationOptional<number>;
    declare ligaId: string;
    declare equipoUuid: string;
    declare jugadorPro: number;
    declare jornadaInicio: number;
    declare jornadaFin: number | null;
    declare precioCompra: number | null;
    declare precioVenta: number | null;
}

Plantilla.init(
    {
        plantillaId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: "plantilla_id"
        },

        ligaId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "liga_id"
        },

        equipoUuid: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "equipo_uuid"
        },

        jugadorPro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "jugador_pro"
        },

        jornadaInicio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "jornada_inicio"
        },

        jornadaFin: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "jornada_fin"
        },

        precioCompra: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "precio_compra"
        },

        precioVenta: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "precio_venta"
        },

    },
    {
        sequelize,
        modelName: "Plantilla",
        tableName: "plantillas",
        timestamps: false
    }
);

export default Plantilla;
