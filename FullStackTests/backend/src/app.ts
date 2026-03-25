import express from "express";
import dotenv from "dotenv";
import routerJugadores from "./routes/jugadores.routes";

import { getPlayersFromApi} from "./footballapi/footballapi.service";

import {testConnectionDB, sequelize, createViewsAndExtensions, logTablesFound} from "./configs/dbconnection.config"

import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "./configs/swaggerjsdoc.config";

import routerUsuarios from "./routes/usuarios.routes";
import routerLigas from "./routes/ligas.routes";
import routerEquipos from "./routes/equipos.routes";
import routerTemporadas from "./routes/temporadas.routes";
import routerJornadas from "./routes/jornadas.routes";
import routerAlineaciones from "./routes/alineaciones.routes";
import routerAuth from "./routes/auth.routes";
import routerPlantillas from "./routes/plantillas.routes";
import routerNoticias from "./routes/noticias.routes";

import {relationsModels} from "./models/relations.models";
import {errorHandler} from "./middleware/errorHandler.middleware";

import {authMiddleware} from "./middleware/authmiddleware/auth.middleware";

import cors from "cors";

import Temporada from "./models/temporadas.models";
import Jornada from "./models/jornadas.models";
import Usuario from "./models/usuario.models";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
let server: ReturnType<typeof app.listen> | null = null;

relationsModels();

app.use(cors({
    origin: 'https://daznfantasy.vercel.app',
    credentials: true
}));


app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/daznfntsy", routerAuth);

app.use('/daznfntsy', authMiddleware, routerUsuarios);

app.use('/daznfntsy', authMiddleware, routerLigas);

app.use('/daznfntsy', authMiddleware, routerAlineaciones);

app.use('/daznfntsy', authMiddleware, routerPlantillas);

app.use('/daznfntsy', authMiddleware, routerJugadores);

app.use('/daznfntsy', authMiddleware, routerEquipos);

app.use('/daznfntsy', authMiddleware, routerTemporadas);

app.use('/daznfntsy', authMiddleware, routerJornadas);

app.use('/daznfntsy', authMiddleware, routerNoticias);

app.use(errorHandler);

async function seedInitialData() {
    const temporadaCount = await Temporada.count();
    if (temporadaCount === 0) {
        const temporada = await Temporada.create({
            fInicio: '2025-08-16',
            fFin: '2026-06-15',
            jornadaActual: 1
        });
        await Jornada.create({
            fInicio: '2025-08-16',
            fFin: '2025-08-18',
            temporadaId: temporada.temporadaId
        });
        console.log("Seed: temporada y jornada inicial creadas");
    }

    const adminCount = await Usuario.count({ where: { rol: 'admin' } });
    if (adminCount === 0) {
        const hash = await bcrypt.hash('adminDazn', 10);
        await Usuario.create({
            username: 'admin',
            email: 'admin@daznfantasy.local',
            passwordHash: hash,
            rol: 'admin',
            fechaNacimiento: '1990-01-01'
        });
        console.log("Seed: usuario admin creado (admin / adminDazn)");
    }
}

async function startDbConnection(){
    try {
        await testConnectionDB();
        await sequelize.sync();
        console.log("Tablas sincronizadas correctamente");
        await createViewsAndExtensions();
        await seedInitialData();
        await logTablesFound();
        server = app.listen(port, ()=> console.log(`Server started on port: ${port}`));
    } catch (error) {
        console.error("Error arrancando el servidor:", error);
        process.exit(1);
    }
}

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

const shutdownSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of shutdownSignals) {
    process.on(signal, () => {
        if (!server) {
            process.exit(0);
            return;
        }
        server.close(() => {
            process.exit(0);
        });
    });
}

startDbConnection().then(() => {
    getPlayersFromApi().catch((error) => {
        console.error("No se pudo sincronizar jugadores desde API externa:", error);
    });
});