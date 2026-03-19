import { QueryTypes, Transaction } from "sequelize";
import { sequelize } from "../configs/dbconnection.config";

type MercadoEstadoRow = { version: number };

export async function asegurarTablaEstadoMercado(): Promise<void> {
    await sequelize.query(
        `CREATE TABLE IF NOT EXISTS admin_estado_mercado (
            id integer PRIMARY KEY DEFAULT 1,
            version integer NOT NULL DEFAULT 1,
            updated_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT single_row_mercado CHECK (id = 1),
            CONSTRAINT version_positive CHECK (version >= 1)
        )`
    );

    await sequelize.query(
        `INSERT INTO admin_estado_mercado (id, version)
         VALUES (1, 1)
         ON CONFLICT (id) DO NOTHING`
    );
}

export async function obtenerVersionMercadoActual(): Promise<number> {
    await asegurarTablaEstadoMercado();
    const rows = await sequelize.query<MercadoEstadoRow>(
        `SELECT version FROM admin_estado_mercado WHERE id = 1`,
        { type: QueryTypes.SELECT }
    );
    return Number(rows[0]?.version ?? 1);
}

export async function incrementarVersionMercado(transaction?: Transaction): Promise<number> {
    await asegurarTablaEstadoMercado();
    const [rows] = await sequelize.query(
        `UPDATE admin_estado_mercado
         SET version = version + 1,
             updated_at = now()
         WHERE id = 1
         RETURNING version`,
        transaction ? { transaction } : {}
    );
    const updated = Array.isArray(rows) ? rows[0] as MercadoEstadoRow : null;
    return Number(updated?.version ?? 1);
}
