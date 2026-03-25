import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_DATABASE as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST as string,
        port: Number(process.env.DB_PORT) || 5432,
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === 'false' ? false : {
                require: true,
                rejectUnauthorized: false,
            },
        },
    }
);

export async function testConnectionDB(){

    try{
        await sequelize.authenticate();
        console.log('Sequelize authenticated successfully in ' + sequelize.getDatabaseName());
    }catch(error){
        console.error('Sequelize authenticated failed: ' + error);
        process.exit(1);
    }
}