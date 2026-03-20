
-- Nos aseguramos de estar en la base de datos correcta
\c fantasyleague;

-- 2. GESTIÓN DE USUARIOS Y EXTENSIONES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'usuario_prueba') THEN
        CREATE USER usuario_prueba WITH PASSWORD 'test' SUPERUSER;
    END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. LIMPIEZA DE ESTRUCTURAS PREVIAS (Para re-ejecución segura)
DROP VIEW IF EXISTS clasificacion_ligas;
DROP TABLE IF EXISTS alineaciones;
DROP TABLE IF EXISTS plantillas;
DROP TABLE IF EXISTS jornadas;
DROP TABLE IF EXISTS temporadas;
DROP TABLE IF EXISTS jugadores;
DROP TABLE IF EXISTS equipos_profesionales;
DROP TABLE IF EXISTS equipos;
DROP TABLE IF EXISTS ligas;
DROP TABLE IF EXISTS usuarios;

-- 4. CREACIÓN DE TABLAS
CREATE TABLE usuarios (
    usuario_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    email varchar(100) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    rol text NOT NULL DEFAULT 'user',
    f_nacim date NOT NULL,
    CONSTRAINT check_f_nacim_pasado CHECK (f_nacim <= CURRENT_DATE)
);

CREATE TABLE ligas (
    liga_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_liga varchar(50) NOT NULL,
    usuario_id uuid NOT NULL REFERENCES usuarios(usuario_id)
);

CREATE TABLE equipos (
    equipo_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre varchar(50) NOT NULL,
    logo text,
    usuario_id uuid NOT NULL REFERENCES usuarios(usuario_id),
    liga_id uuid NOT NULL REFERENCES ligas(liga_id),
    presupuesto integer NOT NULL DEFAULT 10000000,
    CONSTRAINT check_presupuesto_positivo CHECK (presupuesto >= 0),
    CONSTRAINT unique_usuario_liga UNIQUE(usuario_id, liga_id)
);

CREATE TABLE equipos_profesionales (
    equipo_id INTEGER PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    logo TEXT NOT NULL
);

CREATE TABLE jugadores (
    jugador_id integer PRIMARY KEY,
    nombre varchar(50) NOT NULL,
    first_name varchar(50) NULL,
    last_name varchar(50) NULL,
    fecha_nacimiento date NULL,
    nacionalidad varchar(50) NULL,
    lesionado boolean DEFAULT FALSE,
    foto text NULL,
    equipo_profesional_id integer NOT NULL REFERENCES equipos_profesionales(equipo_id),
    posicion text NULL,
    valor integer NOT NULL DEFAULT 1000000,
    CONSTRAINT check_valor_positivo CHECK (valor > 0),
    CONSTRAINT check_posicion CHECK (posicion IN ('Goalkeeper', 'Defender', 'Midfielder', 'Attacker'))
);

CREATE TABLE temporadas (
    temporada_id serial PRIMARY KEY,
    f_inicio date NOT NULL,
    f_fin date NOT NULL,
    jornada_actual integer NOT NULL DEFAULT 1,
    CONSTRAINT check_jornada_actual CHECK (jornada_actual BETWEEN 1 AND 38),
    CONSTRAINT check_fechas_validate CHECK (f_fin > f_inicio)
);

CREATE TABLE jornadas (
    jornada_id serial PRIMARY KEY,
    f_inicio date NOT NULL,
    f_fin date NOT NULL,
    temporada_id integer NOT NULL REFERENCES temporadas(temporada_id),
    CONSTRAINT check_fechas_jornada CHECK (f_fin > f_inicio)
);

CREATE TABLE plantillas (
    plantilla_id serial PRIMARY KEY,
    equipo_uuid uuid NOT NULL REFERENCES equipos(equipo_id),
    liga_id uuid NOT NULL REFERENCES ligas(liga_id),
    jugador_pro integer NOT NULL REFERENCES jugadores(jugador_id),
    jornada_inicio integer NOT NULL REFERENCES jornadas(jornada_id),
    precio_compra integer NOT NULL,
    precio_venta integer,
    jornada_fin integer REFERENCES jornadas(jornada_id),
    CONSTRAINT check_precio_compra CHECK ((precio_compra >=0) AND (precio_venta IS NULL OR precio_venta >=0)),
    CONSTRAINT check_jornada_fin CHECK (jornada_fin IS NULL OR jornada_fin > jornada_inicio)
);

CREATE UNIQUE INDEX unique_jugador_por_liga ON plantillas (liga_id, jugador_pro) WHERE jornada_fin IS NULL;

CREATE TABLE alineaciones (
    equipo_id uuid NOT NULL REFERENCES equipos(equipo_id),
    jugador_id integer NOT NULL REFERENCES jugadores(jugador_id),
    jornada_id integer NOT NULL REFERENCES jornadas(jornada_id),
    puntuacion integer NOT NULL,
    PRIMARY KEY (equipo_id, jugador_id, jornada_id),
    CONSTRAINT check_puntuacion_notlesszero CHECK (puntuacion >= 0)
);

-- 5. VISTAS Y FUNCIONES
CREATE OR REPLACE VIEW clasificacion_ligas AS
SELECT
    e.liga_id,
    e.equipo_id,
    e.nombre AS nombre_equipo,
    COALESCE(SUM(a.puntuacion), 0) AS puntos
FROM equipos e
LEFT JOIN alineaciones a ON a.equipo_id = e.equipo_id
GROUP BY e.liga_id, e.equipo_id, e.nombre;

CREATE OR REPLACE FUNCTION inicializar_40_ligas_demo()
RETURNS void AS $$
DECLARE
    rec RECORD;
    liga_num integer := 1;
BEGIN
    FOR rec IN
        SELECT usuario_id, username
        FROM usuarios
        WHERE username LIKE 'user\_demo\_%'
        ORDER BY username
    LOOP
        INSERT INTO ligas (nombre_liga, usuario_id)
        VALUES ('Liga Demo ' || liga_num, rec.usuario_id);
        liga_num := liga_num + 1;

        INSERT INTO ligas (nombre_liga, usuario_id)
        VALUES ('Liga Demo ' || liga_num, rec.usuario_id);
        liga_num := liga_num + 1;
    END LOOP;

    RAISE NOTICE 'Se crearon % ligas demo', liga_num - 1;
END;
$$ LANGUAGE plpgsql;

-- 6. INSERCIÓN DE DATOS INICIALES
INSERT INTO temporadas (f_inicio, f_fin) VALUES ('2025-08-16', '2026-06-15');
INSERT INTO jornadas (f_inicio, f_fin, temporada_id) VALUES ('2025-08-16', '2025-08-18', 1);

-- Admin por defecto
INSERT INTO usuarios (username, email, password_hash, rol, f_nacim)
VALUES ('admin', 'admin@daznfantasy.local', crypt('adminDazn', gen_salt('bf')), 'admin', '1990-01-01')
ON CONFLICT (username) DO NOTHING;

-- Usuarios demo
DO $$
DECLARE i integer;
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO usuarios (username, email, password_hash, rol, f_nacim)
        VALUES ('user_demo_' || i, 'user_demo_' || i || '@daznfantasy.local', crypt('demoDazn', gen_salt('bf')), 'user', '1995-01-01')
        ON CONFLICT (username) DO NOTHING;
    END LOOP;
END $$;

-- 7. EJECUCIÓN DE SEED
SELECT inicializar_40_ligas_demo();

-- 8. PERMISOS FINALES
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO usuario_prueba;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO usuario_prueba;