import express from 'express'
const router = express.Router()
import transactionController from '../controllers/transactionController.js'

router.get('/:id', transactionController.getTransaction)
router.post('/', transactionController.newTransaction)
router.post('/:id/approve', transactionController.approveTransaction)
router.post('/:id/gateway_update', transactionController.gatewayUpdate)

export default router