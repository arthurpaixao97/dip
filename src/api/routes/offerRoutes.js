import express from 'express'
const router = express.Router()
import offerController from '../controllers/offerController.js'


router.get('/:id', offerController.getOffer)
router.post('/', offerController.newOffer)

export default router