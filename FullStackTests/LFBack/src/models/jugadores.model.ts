import {CreationOptional, DataTypes, Model} from "sequelize";
import {sequelize} from "../configs/dbconnection.config";


class Jugador extends Model{
    declare jugadorId: number;
    declare nombre: string;
    declare firstName: string;
    declare lastName: string;
    declare fechaNacimiento: Date | null;
    declare nacionalidad: string;
    declare lesionado: boolean;
    declare foto: string;
    declare equipoProfesional: number | null;
    declare posicion: "Goalkeeper" | "Defender" | "Midfielder" | "Attacker" | null;
    declare valor: number;
}

Jugador.init(
    {


        jugadorId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          field: 'jugador_id',
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'nombre',
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'first_name',
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'last_name',
        },

        fechaNacimiento: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'fecha_nacimiento',
        },

        nacionalidad: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'nacionalidad',
        },

        lesionado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'lesionado',
        },

        foto: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'foto',
        },

        equipoProfesional: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'equipo_profesional_id',
        },

        posicion: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'posicion',
        },

        valor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
            field: 'valor',
        }

    },

    {
        sequelize,
        modelName: "Jugador",
        tableName: 'jugadores',
        timestamps: false,
    }
);

export default Jugador;