import express from 'express'
import { seguir, dejarSeguir, misSeguidos, misSeguidores, conteo, seguirUsuario, dejarDeSeguir } from '../controllers/seguidoresController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/seguir/:usuarioId', verifyToken, seguirUsuario)
router.delete('/seguir/:usuarioId', verifyToken, dejarDeSeguir)
router.get('/mis-seguidos', verifyToken, misSeguidos)
router.get('/mis-seguidores', verifyToken, misSeguidores)
router.get('/conteo/:id', conteo)
router.post('/:id', verifyToken, seguir)
router.delete('/:id', verifyToken, dejarSeguir)

export default router
