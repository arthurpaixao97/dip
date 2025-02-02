import express from 'express'
const router = express.Router()
import partnershipController from '../controllers/partnershipController.js'

router.get('/:id', partnershipController.getPartnership)
router.post('/', partnershipController.newPartnership)

export default router