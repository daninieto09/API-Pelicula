import express from 'express'
import { getItem, getPopulares, buscar, getGeneros, limpiarCacheExpirado, estadosCache, getItemStats } from '../controllers/movieTvController.js'
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/populares', getPopulares)
router.get('/busqueda', buscar)
router.get('/generos', getGeneros)
router.get('/item/:tipo/:id', getItem)
router.get('/stats/:contenidoId', getItemStats)
router.delete('/cache', verifyToken, verifyAdmin, limpiarCacheExpirado)
router.get('/cache/stats', verifyToken, verifyAdmin, estadosCache)

export default router
