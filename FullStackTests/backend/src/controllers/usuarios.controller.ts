import {Request, Response} from 'express';

import Usuario from "../models/usuario.models";
import {Op} from "sequelize";
import Equipo from "../models/equipos.models";
import Liga from "../models/ligas.models";

import bcrypt from "bcrypt";

import {loginService} from "../services/login.service";

const SAFE_USER_ATTRIBUTES = ["usuarioId", "username", "email", "rol", "fechaNacimiento"] as const;

export async function registrarNuevoUsuario(req: Request, res: Response) {
    try {
        const { username, email, password} = req.body;
        const fechaNacimiento = res.locals.fechaNacimiento;

        const existe = await Usuario.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existe) {
            const campo = existe.username === username ? 'username' : 'email';
            return res.status(400).json({
                error: `El ${campo} ya está registrado`
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const usuarioCreado = await Usuario.create({
            username,
            email,
            passwordHash: hash,
            fechaNacimiento,
        });

        return res.status(201).json({ ok: true, username: usuarioCreado.username });

    } catch (error: any) {
        console.error('ERROR AL CREAR USUARIO:', error);

        return res.status(500).json({
            error: 'Error interno al crear el usuario'
        });
    }
}

export async function loginUsuario(req: Request, res: Response) {
    const {username, password} = req.body;

    try {
        const loginData = await loginService(username, password);
        return res.status(200).json(loginData);
    } catch (error) {
        return res.status(401).json({
            error: 'Usuario o contraseña incorrectos'
        });
    }
}

export async function obtenerTodosLosUsuarios(req: Request, res: Response) {
    try {
        const listadoUsuarios = await Usuario.findAll({
            attributes: [...SAFE_USER_ATTRIBUTES]
        });
        return res.status(200).json(listadoUsuarios);
    } catch (e) {
        return res.status(500).json({ error: "Error al obtener usuarios" });
    }
}

export function obtenerUsuarioPorId(req: Request, res: Response) {
    try {
        const usuarioObtenido = res.locals.usuario;

        if (!usuarioObtenido) {
            return res.status(404).json({
                error: 'No existe un usuario seleccionado'
            });
        }

        return res.status(200).json(usuarioObtenido);
    } catch (e) {
        console.error('Error en obtenerUsuarioPorId:', e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export async function obtenerUsuarioPorNombreDeUsuario(req: Request, res: Response) {
    try {
        const username = req.params.username;

        const usuarioObtenido = await Usuario.findOne({
            where: { username },
            attributes: [...SAFE_USER_ATTRIBUTES]
        });

        if (!usuarioObtenido) {
            return res.status(404).json({
                error: `No existe un usuario con el nombre de usuario ${username}`
            });
        }

        return res.status(200).json(usuarioObtenido);
    } catch (e) {
        console.error('Error en obtenerUsuarioPorNombreDeUsuario:', e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export async function obtenerEquiposDelUsuarioYLigas(req: Request, res: Response) {
    try {
        const usuario = res.locals.jwtUser;

        const usuarioYEquipos = await Usuario.findByPk(usuario.sub, {
            attributes: ["username"],
            include: [
                {
                    model: Equipo,
                    attributes: ['equipoId', 'nombre', 'ligaId'],
                    include: [
                        {
                            model: Liga,
                            attributes: ['ligaId', 'nombreLiga'],
                        }
                    ]
                }
            ]
        });

        if (!usuarioYEquipos) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json(usuarioYEquipos);
    } catch (e) {
        console.error('Error en obtenerEquiposDelUsuarioYLigas:', e);
        return res.status(500).json({ error: 'Error al obtener equipos del usuario' });
    }
}

export async function modificarUsuario(req: Request, res: Response) {
    try {
        const usuarioId = res.locals.jwtUser.sub;
        const {username, email, fechaNacimiento} = req.body;

        if (email) {
            const emailExist = await Usuario.findOne({where: {email}});
            if (emailExist && emailExist.usuarioId !== usuarioId) {
                return res.status(400).json({
                    error: 'Este email ya pertenece a otro usuario'
                });
            }
        }

        if (username) {
            const usernameExist = await Usuario.findOne({where: {username}});
            if (usernameExist && usernameExist.usuarioId !== usuarioId) {
                return res.status(400).json({
                    error: 'Este nombre de usuario ya está en uso'
                });
            }
        }

        const usuario = await Usuario.findByPk(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                error: 'No existe el usuario'
            });
        }

        const userDataToUpdate: Record<string, string> = {};
        if (username) userDataToUpdate.username = username;
        if (email) userDataToUpdate.email = email;
        if (fechaNacimiento) userDataToUpdate.fechaNacimiento = fechaNacimiento;

        await usuario.update(userDataToUpdate);

        return res.status(200).json({
            usuarioId: usuario.usuarioId,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            fechaNacimiento: usuario.fechaNacimiento,
        });
    } catch (e) {
        console.error('Error en modificarUsuario:', e);
        return res.status(500).json({ error: 'Error al modificar usuario' });
    }
}