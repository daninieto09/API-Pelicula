import express from 'express'
import { darLike, quitarLike, getLikeCountCtrl, checkLikeCtrl } from '../controllers/likesController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', verifyToken, darLike)
router.delete('/', verifyToken, quitarLike)
router.get('/check', verifyToken, checkLikeCtrl)
router.get('/count', getLikeCountCtrl)

export default router
