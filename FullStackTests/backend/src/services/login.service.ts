import Usuario from "../models/usuario.models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function loginService(username: string, password: string) {

    const usuario = await Usuario.findOne({ where: { username } });

    if (!usuario) throw new Error("Credenciales");

    const ok = await bcrypt.compare(password, usuario.passwordHash);

    if (!ok) throw new Error("Credenciales");

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET no configurado en el servidor");
    }

    const token = jwt.sign(
        { sub: usuario.usuarioId, rol: usuario.rol },
        secret,
        { expiresIn: "1h" }
    );

    return {
        token,
        user: {
            uuid: usuario.usuarioId,
            username: usuario.username,
            rol: usuario.rol
        }
    };
}