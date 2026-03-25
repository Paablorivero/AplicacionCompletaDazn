import { Router, Request, Response } from "express";

const routerNoticias = Router();

const NEWSAPI_BASE = "https://newsapi.org/v2/everything";
const NEWSAPI_KEY = process.env.NEWSAPI_KEY || "f529abbf0c5742389196a2f0e8128883";

routerNoticias.get("/noticias", async (req: Request, res: Response) => {
    try {
        const params = new URLSearchParams({
            q: "fútbol",
            language: "es",
            sortBy: "publishedAt",
            page: "1",
            pageSize: "100",
            apiKey: NEWSAPI_KEY,
        });

        const from = req.query.from as string | undefined;
        const to = req.query.to as string | undefined;
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const response = await fetch(`${NEWSAPI_BASE}?${params.toString()}`);
        const data = await response.json();

        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(502).json({ error: "Error obteniendo noticias" });
    }
});

export default routerNoticias;
