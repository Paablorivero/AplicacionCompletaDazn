import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';


const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'DAZN FANTASY LEAGUE',
        version: '1.0.0',
        description: 'Documentación de la API',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    servers: [
        {
            url: 'https://daznfntsy.up.railway.app/daznfntsy',
            description: 'Servidor de producción',
        },
        {
            url: 'http://localhost:3000/daznfntsy',
            description: 'Servidor local',
        },
    ],
};

const options: swaggerJsdoc.Options = {
    swaggerDefinition,

    apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
