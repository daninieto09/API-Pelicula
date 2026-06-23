import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, updatePerfilSchema, updatePasswordSchema } from '../schemas/authSchema.js';
import { findUserByEmail, createUser, isFirstUser, deleteOwnAccount, exportUserData, updateUserProfile, updateUserPassword, getDashboard as getDashboardData } from '../models/userModel.js';
import prisma from '../config/prismaClientConfig.js';

const DEV = process.env.NODE_ENV !== 'production'
const cookieOptions = {
    httpOnly: true,
    secure: !DEV,
    sameSite: DEV ? 'lax' : 'none',
    maxAge: DEV ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 24h dev / 1h prod
}

export const registerUser = async (req, res) => {
    try {
        const { nombre, email, password } = registerSchema.parse(req.body)

        const existingUser = await findUserByEmail(email)
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' })
        }

        const firstUser = await isFirstUser()
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await createUser(nombre, email, hashedPassword)

        const token = jwt.sign(
            { userId: newUser.id, isAdmin: firstUser },
            process.env.JWT_SECRET,
            { expiresIn: DEV ? '24h' : '1h' }
        )

        res.cookie('accessToken', token, cookieOptions)
            .status(201)
            .json({
                message: 'Usuario registrado exitosamente',
                usuario: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, isAdmin: firstUser },
            })

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors })
        }
        res.status(500).json({ message: 'Error en el servidor' })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body)

        const user = await findUserByEmail(email)
        if (!user) {
            return res.status(400).json({ message: 'Credenciales incorrectas' })
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Credenciales incorrectas' })
        }

        const token = jwt.sign(
            { userId: user.id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: DEV ? '24h' : '1h' }
        )

        res.cookie('accessToken', token, cookieOptions)
            .status(200)
            .json({
                message: 'Login exitoso',
                usuario: { id: user.id, nombre: user.nombre, email: user.email, isAdmin: user.isAdmin },
            })

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors })
        }
        res.status(500).json({ message: 'Error en el servidor' })
    }
}

export const logoutUser = async (req, res) => {
    res.clearCookie('accessToken')
        .status(200)
        .json({ message: 'Sesión cerrada exitosamente' })
}

export const actualizarPerfil = async (req, res) => {
    try {
        const { nombre, email } = updatePerfilSchema.parse(req.body)
        const existente = await findUserByEmail(email)
        if (existente && existente.id !== req.user.id) {
            return res.status(400).json({ message: 'Ese email ya está en uso por otra cuenta' })
        }
        const usuario = await updateUserProfile(req.user.id, nombre, email)
        res.json({ message: 'Perfil actualizado', usuario })
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: error.errors[0].message })
        res.status(500).json({ message: 'Error al actualizar perfil' })
    }
}

export const actualizarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = updatePasswordSchema.parse(req.body)
        const user = await findUserByEmail(req.user.email)
        const coincide = await bcrypt.compare(passwordActual, user.password)
        if (!coincide) return res.status(400).json({ message: 'La contraseña actual es incorrecta' })
        const hashed = await bcrypt.hash(passwordNueva, 10)
        await updateUserPassword(req.user.id, hashed)
        res.json({ message: 'Contraseña actualizada correctamente' })
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: error.errors[0].message })
        res.status(500).json({ message: 'Error al actualizar contraseña' })
    }
}

export const deleteAccount = async (req, res) => {
    try {
        await deleteOwnAccount(req.user.id)
        res.clearCookie('accessToken').json({ message: 'Cuenta eliminada exitosamente' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar cuenta' })
    }
}

export const exportarDatos = async (req, res) => {
    try {
        const datos = await exportUserData(req.user.id)
        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error al exportar datos' })
    }
}

export const getDashboard = async (req, res) => {
    try {
        const datos = await getDashboardData(req.user.id)
        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error al obtener el dashboard' })
    }
}

export const getProfile = async (req, res) => {
    try {
        const [favoritos, resenas, listas, historial] = await Promise.all([
            prisma.favorito.count({ where: { usuarioId: req.user.id } }),
            prisma.resena.count({ where: { usuarioId: req.user.id } }),
            prisma.lista.count({ where: { usuarioId: req.user.id } }),
            prisma.historialVista.count({ where: { usuarioId: req.user.id } }),
        ])
        res.json({
            usuario: req.user,
            stats: { favoritos, resenas, listas, historial },
        })
    } catch {
        res.status(500).json({ message: 'Error al obtener perfil' })
    }
}
