import express from 'express'
const router = express.Router()
import walletController from '../controllers/walletController.js'


router.get('/:id', walletController.getWallet)
router.post('/', walletController.walletNewEntry)

export default router