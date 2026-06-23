import express from 'express'
import { getResenasContenido, getMisResenas, crearResena, actualizarResena, eliminarResena, getComentariosResena, crearComentarioResena, getResenasDeUsuario } from '../controllers/resenasController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/usuario/:id', getResenasDeUsuario)
router.get('/', getResenasContenido)
router.get('/mis-resenas', verifyToken, getMisResenas)
router.post('/', verifyToken, crearResena)
router.put('/:id', verifyToken, actualizarResena)
router.delete('/:id', verifyToken, eliminarResena)
router.get('/:resenaId/comentarios', getComentariosResena)
router.post('/:resenaId/comentarios', verifyToken, crearComentarioResena)

export default router
