import dotenv from 'dotenv';
dotenv.config();

// ─── Validación de variables de entorno al arrancar ───────────────────────────
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'TMDB_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
    console.error(`[server] Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import prisma from './config/prismaClientConfig.js';

// Rutas
import publicMovieRoutes from './routes/publicMovieRoutes.js';
import movieTvRoutes from './routes/movieTvRoutes.js';
import authRoutes from './routes/authRoutes.js';
import favoritosRoutes from './routes/favoritosRoutes.js';
import resenasRoutes from './routes/resenasRoutes.js';
import listasRoutes from './routes/listasRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import seguidoresRoutes from './routes/seguidoresRoutes.js';
import comentariosRoutes from './routes/comentariosRoutes.js';
import comentariosListasRoutes from './routes/comentariosListasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import likesRoutes from './routes/likesRoutes.js';

// Middleware de errores (debe importarse al final)
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGINS = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://api-moviesandtv.netlify.app'];

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ─── Rutas públicas ───────────────────────────────────────────────────────────
// Home público: populares y trending para landing/slider (sin autenticación, con caché)
app.use('/api/movies', publicMovieRoutes);

// Autenticación: register y login tienen rate limiting propio en authRoutes.js
app.use('/api/auth', authRoutes);

// Contenido TMDB (búsqueda, detalle, géneros — usadas por la app autenticada)
app.use('/api/peliculas', movieTvRoutes);

// Datos públicos de listas y usuarios
app.use('/api/listas', listasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Datos públicos de reseñas (GET sin auth, POST/PUT/DELETE requieren token)
app.use('/api/resenas', resenasRoutes);

// Comentarios de reseñas y listas (algunos GET son públicos)
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/listas', comentariosListasRoutes);

// Conteo de likes y seguidores (públicos)
app.use('/api/likes', likesRoutes);
app.use('/api/social', seguidoresRoutes);

// ─── Rutas protegidas (requieren verifyToken en cada router) ──────────────────
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/historial', historialRoutes);

// Admin: verifyToken + verifyAdmin aplicado a nivel de router en adminRoutes.js
app.use('/api/admin', adminRoutes);

// ─── Error handler centralizado (siempre al final) ────────────────────────────
app.use(errorHandler);

// ─── Arranque ─────────────────────────────────────────────────────────────────
prisma.$connect()
    .then(() => {
        console.log('[db] Conexión exitosa a PostgreSQL via Prisma');
        app.listen(PORT, () => {
            console.log(`[server] Corriendo en http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
        });
    })
    .catch((err) => {
        console.error('[db] Error conectando a la base de datos:', err);
        process.exit(1);
    });
