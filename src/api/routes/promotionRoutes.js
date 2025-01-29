import express from 'express'
const router = express.Router()
import promotionController from '../controllers/promotionController.js'

router.get('/:id', promotionController.getPromotion)
router.post('/', promotionController.newPromotion)

export default router