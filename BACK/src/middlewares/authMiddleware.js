import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModel.js';

export const verifyToken = async (req, res, next) => {

    try {
     
        //extraer el token de la cookie
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' })
        }

        //verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        //buscar el usuario por el id y verificar q aun existe en la db
        const user = await findUserById(decoded.userId)

        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' })
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' })
        }

        req.user = user;
        next()
        

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'El token ha expirado, inicia sesión nuevamente' })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' })
        }
        res.status(500).json({ message: 'Error en el servidor' })
    }

}
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken
        if (!token) return next()
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await findUserById(decoded.userId)
        if (user?.isActive) req.user = user
        next()
    } catch {
        next()
    }
}

export const verifyAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado, se requieren permisos de administrador' })
    }
    next()
}