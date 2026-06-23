import express from 'express'
import { getMisListas, getListaByIdCtrl, crearLista, eliminarLista, getContenidosLista, agregarALista, quitarDeLista, listarPublicas, getListasDeUsuario } from '../controllers/listasController.js'
import { verifyToken, optionalAuth } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/publicas', listarPublicas)
router.get('/usuario/:id', getListasDeUsuario)
router.get('/', verifyToken, getMisListas)
router.post('/', verifyToken, crearLista)
router.delete('/:id', verifyToken, eliminarLista)
router.get('/:id', optionalAuth, getListaByIdCtrl)
router.get('/:id/contenidos', getContenidosLista)
router.post('/:id/contenidos', verifyToken, agregarALista)
router.delete('/:id/contenidos/:contenidoId', verifyToken, quitarDeLista)

export default router
