-- Database: fantasy_league

DROP DATABASE IF EXISTS fantasy_league;

CREATE DATABASE fantasy_league
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_ES.UTF8'
    LC_CTYPE = 'es_ES.UTF8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

--Creamos un usuario que es el que vamos a usar por ahora y le damos todos los privilegios para poder trabajar y hacer pruebas
	drop user if exists usuario_prueba;
	create user usuario_prueba  with password 'test' superuser;

	drop function if exists sortear_jugadores_posicion;
	drop function if exists crear_ligas_demo;
	drop function if exists poblar_ligas_con_jugadores_demo;
	drop function if exists inicializar_40_ligas_demo;
	drop view if exists clasificacion_ligas;
	drop table if exists alineaciones;
	drop table if exists plantillas;
	drop table if exists jornadas;
	drop table if exists temporadas;
	drop table if exists jugadores;
	drop table if exists equipos_profesionales;
	drop table if exists equipos;
	drop table if exists ligas;
	drop table if exists usuarios;

-- Parece ser que para usar UUID y almacenar correctamente los pass necesito la extensión pgcrypto

	create extension if not exists pgcrypto;

-- Empezamos a crear las tablas
	create table if not exists usuarios (
		usuario_id uuid default gen_random_uuid() primary key,
		username varchar(50) not null unique,
		email varchar(100) not null unique,
		password_hash text not null,
		rol text not null default 'user',
		f_nacim date not null,
		constraint check_f_nacim_pasado
			check (f_nacim <= current_date)
	);

--Existia un campo participantes que iba a ser un contador para poder calcular las plazas libres que quedaban y saber si se 
--llegaba a 20 pero se sustituye ese campo solo por una consulta con un count. Esto funciona por ser más sencillo, quitar complejidad
--a la BD y porque se resuelve más fácil en lugar de tener que actualizar el campo cada vez que se crea un equipo en esa liga.
		create table if not exists ligas(
		liga_id uuid default gen_random_uuid() primary key,
		nombre_liga varchar(50) not null,
		usuario_id uuid not null references usuarios(usuario_id)
	);

--Al principio estaba mal pensado. Lo había planteado de tal forma que un equipo podía pertenecer a varias ligas. Como un equipo
--solo puede pertenecer a una liga, lo lógico, es que el equipo creado lleve una FK que indique a que liga pertenece.

--Visto esto hay que realizar una serie de cambio en el E/R y en el script SQL
	create table if not exists equipos(
		equipo_id uuid default gen_random_uuid() primary key,
		nombre varchar(50) not null,
		logo text,
		usuario_id uuid not null references usuarios(usuario_id),
		liga_id uuid not null references ligas(liga_id),
		presupuesto integer not null default 10000000,
		constraint check_presupuesto_positivo check (presupuesto >= 0),
		constraint unique_usuario_liga unique(usuario_id, liga_id)
	);

	CREATE TABLE IF NOT EXISTS equipos_profesionales (
    	equipo_id INTEGER PRIMARY KEY,
    	nombre VARCHAR(80) NOT NULL,
    	logo TEXT NOT NULL
	);


	create table if not exists jugadores(
		jugador_id integer primary key,
		nombre varchar(50) not null,
		first_name varchar(50) null,
		last_name varchar(50) null,
		fecha_nacimiento date null,
		nacionalidad varchar(50) null,
		lesionado boolean default FALSE,
		foto text null,
		equipo_profesional_id integer not null references equipos_profesionales(equipo_id),
		posicion text null,
		valor integer not null default 1000000,
		constraint check_valor_positivo check (valor > 0),
		constraint check_posicion check ( posicion in ('Goalkeeper', 'Defender', 'Midfielder', 'Attacker'))
	);

	select * from jugadores;

	create table if not exists temporadas(
		temporada_id serial primary key,
		f_inicio date not null,
		f_fin date not null,
		jornada_actual integer not null default 1,
		constraint check_jornada_actual check (jornada_actual between 1 and 38),
		constraint check_fechas_validate
			check (f_fin > f_inicio)
	);

	create table if not exists jornadas(
		jornada_id serial primary key,
		f_inicio date not null,
		f_fin date not null,
		temporada_id integer not null references temporadas(temporada_id),
		constraint check_fechas_jornada
			check (f_fin > f_inicio)
	);

	create table if not exists plantillas(
		plantilla_id serial primary key,
		equipo_uuid uuid not null references equipos(equipo_id),
		liga_id uuid not null references ligas(liga_id),
		jugador_pro integer not null references jugadores(jugador_id),
		jornada_inicio integer not null references jornadas(jornada_id),
		precio_compra integer not null,
		precio_venta integer,
		jornada_fin integer references jornadas(jornada_id),
		constraint check_precio_compra check ((precio_compra >=0) and (precio_venta is null or precio_venta >=0)),
		constraint check_jornada_fin check (jornada_fin is null or jornada_fin > jornada_inicio)
	);

	create unique index unique_jugador_por_liga on plantillas (liga_id, jugador_pro) where jornada_fin is null;

	create table if not exists alineaciones(
		equipo_id uuid not null references equipos(equipo_id),
		jugador_id integer not null references jugadores(jugador_id),
		jornada_id integer not null references jornadas(jornada_id),
		puntuacion integer not null,
		primary key (equipo_id,jugador_id, jornada_id),
		constraint check_puntuacion_notlesszero
			check(puntuacion >= 0)
	);


--Defino una función que va a ser la que realiza el sorteo de jugadores para una plantilla cuando se registra un equipo, ya sea al crear ligas o al unirse creando equipos

--Esto, en esencia es igual a algunas funciones del año pasado, aunque postgre añade sus propias cosas. Lo que hago es mandarle los parametros p que yo quiero, el número de jugadores
--de un tipo que yo quiero (cantidad) y en la jornada, siempre voy a mandar por ahora 1, ya que se supone que es el sorteo de inicio de temporada.
CREATE OR REPLACE FUNCTION sortear_jugadores_posicion(
    p_liga_id uuid,
    p_equipo_id uuid,
    p_posicion text,
    p_cantidad integer,
    p_jornada integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
	--Aqui se define total_coste, para que calcule el total del precio de los jugadores, los sume y luego lo reste del presupuesto del equipo.
    total_coste integer;
BEGIN

    WITH seleccion AS (
        SELECT j.jugador_id, j.valor
        FROM jugadores j
        WHERE j.posicion = p_posicion
        AND j.jugador_id NOT IN (
            SELECT jugador_pro
            FROM plantillas
            WHERE liga_id = p_liga_id
            AND jornada_fin IS NULL
        )
        ORDER BY RANDOM()
        LIMIT p_cantidad
    ),
    insertados AS (
        INSERT INTO plantillas (
            liga_id,
            equipo_uuid,
            jugador_pro,
            jornada_inicio,
            precio_compra
        )
        SELECT
            p_liga_id,
            p_equipo_id,
            jugador_id,
            p_jornada,
            valor
        FROM seleccion
        RETURNING precio_compra
    )
    SELECT COALESCE(SUM(precio_compra),0)
    INTO total_coste
    FROM insertados;

    UPDATE equipos
    SET presupuesto = presupuesto - total_coste
    WHERE equipo_id = p_equipo_id;

END;
$$;

--Para poder usar bien la función anterior debo de llamarla con diferentes parámetro, para las diferentes posiciones.

CREATE OR REPLACE FUNCTION sorteo_inicial_equipo(
    p_liga_id uuid,
    p_equipo_id uuid,
    p_jornada integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN

    PERFORM sortear_jugadores_posicion(
        p_liga_id, p_equipo_id,
        'Goalkeeper', 2, p_jornada
    );

    PERFORM sortear_jugadores_posicion(
        p_liga_id, p_equipo_id,
        'Defender', 5, p_jornada
    );

    PERFORM sortear_jugadores_posicion(
        p_liga_id, p_equipo_id,
        'Midfielder', 4, p_jornada
    );

    PERFORM sortear_jugadores_posicion(
        p_liga_id, p_equipo_id,
        'Attacker', 3, p_jornada
    );

END;
$$;


insert into temporadas (f_inicio, f_fin) values ('2025-08-16','2026-06-15');

insert into jornadas (f_inicio, f_fin, temporada_id) values ('2025-08-16','2025-08-18',1); 


	--Creo una view para calcular las clasificaciones. Luego desde el back se llama a la view pero se filtra por ligaId para obtener la clasificación de una liga.
	
	CREATE OR REPLACE VIEW clasificacion_ligas AS
	SELECT
	    e.liga_id,
	    e.equipo_id,
	    e.nombre AS nombre_equipo,
	    COALESCE(SUM(a.puntuacion),0) AS puntos
	FROM equipos e
	LEFT JOIN alineaciones a
	    ON a.equipo_id = e.equipo_id
	GROUP BY e.liga_id, e.equipo_id, e.nombre;


	---- Todo esto a partir de aquí son lineas que uso como comprobaciones pero que eliminaré cuando crea que el script ya está en un estado definitivo.

	select * from jugadores order by equipo_profesional_id;

	select * from usuarios;

	select * from temporadas;

	select distinct posicion from jugadores;

	select * from equipos_profesionales;

	SELECT COUNT(*)
FROM jugadores
WHERE fecha_nacimiento IS NULL;

SELECT COUNT(*)
FROM jugadores
WHERE equipo_profesional_id IS NULL;

select * from ligas;

select * from equipos;

select u.username, e.nombre, l.nombre_liga from usuarios u
join equipos e on u.usuario_id = e.usuario_id
join ligas l on l.liga_id = e.liga_id;

select j.nombre, j.fecha_nacimiento, j.valor, j.posicion from plantillas p
join equipos e on e.equipo_id = p.equipo_uuid
join jugadores j on j.jugador_id = p.jugador_pro
where e.equipo_id = '19b29d7f-ea1b-481c-ac52-9f1a7faef2f3';

--Query para comprobar que al generar una alineación inicial están las posiciones que quiero
select * from alineaciones a
join jugadores j on a.jugador_id = j.jugador_id
order by j.posicion;

select * from equipos;


-- Crea N ligas de demo asignando el propietario de forma rotativa.
CREATE OR REPLACE FUNCTION crear_ligas_demo(
    p_total_ligas integer DEFAULT 40
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    usuarios_ids uuid[];
    usuarios_count integer;
    i integer;
    owner_idx integer;
BEGIN
    IF p_total_ligas <= 0 THEN
        RAISE EXCEPTION 'p_total_ligas debe ser mayor que 0';
    END IF;

    SELECT array_agg(usuario_id ORDER BY usuario_id)
    INTO usuarios_ids
    FROM usuarios;

    usuarios_count := COALESCE(array_length(usuarios_ids, 1), 0);
    IF usuarios_count = 0 THEN
        RAISE EXCEPTION 'No hay usuarios para asignar como propietarios de liga';
    END IF;

    FOR i IN 1..p_total_ligas LOOP
        owner_idx := ((i - 1) % usuarios_count) + 1;
        INSERT INTO ligas (nombre_liga, usuario_id)
        VALUES ('Liga Fantasy ' || i, usuarios_ids[owner_idx]);
    END LOOP;

    RETURN p_total_ligas;
END;
$$;

-- Garantiza que cada liga tenga entre 10 y 20 jugadores en plantilla activa.
-- Si la liga no tiene equipo, se crea uno de demo para poder asignar jugadores.
CREATE OR REPLACE FUNCTION poblar_ligas_con_jugadores_demo(
    p_min_jugadores integer DEFAULT 10,
    p_max_jugadores integer DEFAULT 20,
    p_jornada integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    liga_row record;
    equipo_id_objetivo uuid;
    jugadores_actuales integer;
    jugadores_objetivo integer;
    jugadores_a_insertar integer;
    owner_liga uuid;
BEGIN
    IF p_min_jugadores < 1 OR p_max_jugadores < p_min_jugadores THEN
        RAISE EXCEPTION 'Rango de jugadores invalido';
    END IF;

    FOR liga_row IN
        SELECT l.liga_id, l.usuario_id
        FROM ligas l
    LOOP
        owner_liga := liga_row.usuario_id;

        SELECT e.equipo_id
        INTO equipo_id_objetivo
        FROM equipos e
        WHERE e.liga_id = liga_row.liga_id
        ORDER BY e.equipo_id
        LIMIT 1;

        IF equipo_id_objetivo IS NULL THEN
            INSERT INTO equipos (nombre, logo, usuario_id, liga_id, presupuesto)
            VALUES (
                'Equipo Demo ' || substring(liga_row.liga_id::text from 1 for 6),
                NULL,
                owner_liga,
                liga_row.liga_id,
                100000000
            )
            RETURNING equipo_id INTO equipo_id_objetivo;
        END IF;

        SELECT COUNT(*)
        INTO jugadores_actuales
        FROM plantillas p
        WHERE p.liga_id = liga_row.liga_id
          AND p.jornada_fin IS NULL;

        IF jugadores_actuales < p_min_jugadores THEN
            jugadores_objetivo := floor(random() * (p_max_jugadores - p_min_jugadores + 1) + p_min_jugadores)::integer;
            jugadores_a_insertar := jugadores_objetivo - jugadores_actuales;

            INSERT INTO plantillas (equipo_uuid, liga_id, jugador_pro, jornada_inicio, precio_compra)
            SELECT
                equipo_id_objetivo,
                liga_row.liga_id,
                j.jugador_id,
                p_jornada,
                j.valor
            FROM jugadores j
            WHERE j.jugador_id NOT IN (
                SELECT p2.jugador_pro
                FROM plantillas p2
                WHERE p2.liga_id = liga_row.liga_id
                  AND p2.jornada_fin IS NULL
            )
            ORDER BY random()
            LIMIT jugadores_a_insertar;
        END IF;
    END LOOP;

    RETURN (SELECT COUNT(*) FROM ligas);
END;
$$;

-- Helper principal: crea 40 ligas de demo sin poblar plantillas.
CREATE OR REPLACE FUNCTION inicializar_40_ligas_demo()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM crear_ligas_demo(40);
END;
$$;

-- Usuario administrador por defecto (login: admin / password: adminDazn)
INSERT INTO usuarios (username, email, password_hash, rol, f_nacim)
VALUES (
    'admin',
    'admin@daznfantasy.local',
    crypt('adminDazn', gen_salt('bf')),
    'admin',
    '1990-01-01'
)
ON CONFLICT (username) DO UPDATE
SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    rol = EXCLUDED.rol,
    f_nacim = EXCLUDED.f_nacim;

-- Usuarios demo adicionales para repartir la propiedad de ligas.
DO $$
DECLARE
    i integer;
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO usuarios (username, email, password_hash, rol, f_nacim)
        VALUES (
            'user_demo_' || i,
            'user_demo_' || i || '@daznfantasy.local',
            crypt('demoDazn', gen_salt('bf')),
            'user',
            '1995-01-01'
        )
        ON CONFLICT (username) DO UPDATE
        SET
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            rol = EXCLUDED.rol,
            f_nacim = EXCLUDED.f_nacim;
    END LOOP;
END $$;

-- Ejecuta seed de demo automáticamente.
SELECT inicializar_40_ligas_demo();

SELECT l.nombre_liga, u.username 
FROM ligas l 
JOIN usuarios u ON l.usuario_id = u.usuario_id;
