import type { CorsOptions } from "cors";
import type { Request, Response, NextFunction } from "express";

const DEFAULT_ORIGINS = [
    "https://daznfantasy.vercel.app",
    "https://www.daznfantasy.vercel.app",
    "http://localhost:4200",
    "http://127.0.0.1:4200",
];

function normalizeOrigin(origin: string): string {
    return origin.trim().replace(/\/$/, "");
}

function parseEnvOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS?.trim();
    if (!raw) {
        return [];
    }

    return raw.split(",").map(normalizeOrigin).filter(Boolean);
}

function getAllowedOrigins(): Set<string> {
    return new Set([
        ...DEFAULT_ORIGINS.map(normalizeOrigin),
        ...parseEnvOrigins(),
    ]);
}

export function isAllowedOrigin(origin: string | undefined): boolean {
    if (!origin || origin === "null") {
        return true;
    }

    const normalized = normalizeOrigin(origin);

    if (getAllowedOrigins().has(normalized)) {
        return true;
    }

    // Cualquier despliegue en Vercel (producción, previews, alias).
    if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(normalized)) {
        return true;
    }

    // Desarrollo local en cualquier puerto.
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
        return true;
    }

    return false;
}

export const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        console.warn(`[CORS] Origen rechazado: ${origin}`);
        callback(null, false);
    },
    credentials: true,
};

export function applyCorsHeaders(req: Request, res: Response): void {
    const origin = req.headers.origin;

    if (typeof origin === "string" && isAllowedOrigin(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
    }
}

export function corsHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;

    if (typeof origin === "string" && isAllowedOrigin(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
        res.setHeader(
            "Access-Control-Allow-Headers",
            req.headers["access-control-request-headers"] ?? "Content-Type, Authorization"
        );
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
}
