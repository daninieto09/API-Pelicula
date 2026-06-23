import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, logoutUser, getProfile, getDashboard, deleteAccount, exportarDatos, actualizarPerfil, actualizarPassword } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.' } },
})

// === Rutas públicas con rate limiting para establecer tiempo de registro y login ===
router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.post('/logout', logoutUser)

// === Rutas protegidas ===
router.get('/profile', verifyToken, getProfile)
router.get('/dashboard', verifyToken, getDashboard)
router.patch('/perfil', verifyToken, actualizarPerfil)
router.patch('/password', verifyToken, actualizarPassword)
router.delete('/cuenta', verifyToken, deleteAccount)
router.get('/exportar', verifyToken, exportarDatos)

export default router;
