import express from 'express'
const router = express.Router()
import recurrenceController from '../controllers/recurrenceController.js'

router.get('/:id', recurrenceController.getRecurrence)
router.get('/', recurrenceController.getRecurrences)
router.post('/', recurrenceController.newRecurrence)
router.post('/:id/renewal', recurrenceController.newRecurrency)
router.post('/charge/:id', recurrenceController.recurrencyNewCharge)
router.post('/change_payment_info/:id', recurrenceController.changePaymentInfo)
router.post('/change_offer/:id', recurrenceController.changeOffer)
router.post('/change_offer_now/:id', recurrenceController.changeOfferNow)

export default router