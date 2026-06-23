import express from 'express'
import { getMisFavoritos, agregarFavorito, eliminarFavorito, checkFavorito, getFavoritosDeUsuario } from '../controllers/favoritosController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/usuario/:id', getFavoritosDeUsuario)
router.get('/', verifyToken, getMisFavoritos)
router.get('/check/:contenidoId', verifyToken, checkFavorito)
router.post('/', verifyToken, agregarFavorito)
router.delete('/:id', verifyToken, eliminarFavorito)

export default router
