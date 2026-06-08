import type { CorsOptions } from "cors";
import type { Request, Response } from "express";

const DEFAULT_ORIGINS = [
    "https://daznfantasy.vercel.app",
    "https://www.daznfantasy.vercel.app",
    "http://localhost:4200",
    "http://127.0.0.1:4200",
];

function normalizeOrigin(origin: string): string {
    return origin.trim().replace(/\/$/, "");
}

function parseAllowedOrigins(): Set<string> {
    const raw = process.env.CORS_ORIGINS?.trim();
    const origins = raw
        ? raw.split(",").map(normalizeOrigin).filter(Boolean)
        : DEFAULT_ORIGINS.map(normalizeOrigin);

    return new Set(origins);
}

export function isAllowedOrigin(origin: string | undefined): boolean {
    if (!origin) {
        return true;
    }

    const normalized = normalizeOrigin(origin);
    const allowed = parseAllowedOrigins();

    if (allowed.has(normalized)) {
        return true;
    }

    return /^https:\/\/(www\.)?daznfantasy[\w.-]*\.vercel\.app$/i.test(normalized);
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
