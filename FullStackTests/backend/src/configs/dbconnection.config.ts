import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

function createSequelize(): Sequelize {
    if (databaseUrl) {
        console.log('Conectando con DATABASE_URL');
        return new Sequelize(databaseUrl, {
            dialect: 'postgres',
            logging: false,
        });
    }

    console.log('Conectando con variables individuales (DB_HOST, DB_DATABASE, etc.)');
    const useSSL = process.env.DB_SSL === 'true';
    return new Sequelize(
        process.env.DB_DATABASE as string,
        process.env.DB_USER as string,
        process.env.DB_PASSWORD as string,
        {
            dialect: 'postgres',
            host: process.env.DB_HOST as string,
            port: Number(process.env.DB_PORT) || 5432,
            logging: false,
            ...(useSSL && {
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    },
                },
            }),
        }
    );
}

export const sequelize = createSequelize();

export async function testConnectionDB(){
    try{
        await sequelize.authenticate();
        console.log('Sequelize authenticated successfully in ' + sequelize.getDatabaseName());
    }catch(error){
        console.error('Sequelize authenticated failed: ' + error);
        process.exit(1);
    }
}

export async function createViewsAndExtensions(){
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await sequelize.query(`
        CREATE OR REPLACE VIEW clasificacion_ligas AS
        SELECT
            e.liga_id,
            e.equipo_id,
            e.nombre AS nombre_equipo,
            COALESCE(SUM(a.puntuacion), 0) AS puntos
        FROM equipos e
        LEFT JOIN alineaciones a ON a.equipo_id = e.equipo_id
        GROUP BY e.liga_id, e.equipo_id, e.nombre;
    `);
    console.log("View clasificacion_ligas creada/actualizada");
}

export async function logTablesFound(){
    const [results] = await sequelize.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );
    const tableNames = results.map((r: any) => r.table_name ?? Object.values(r)[0]);
    console.log('Tablas en public:', tableNames);
}