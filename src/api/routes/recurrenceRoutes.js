import express from 'express'
const router = express.Router()
import recurrenceController from '../controllers/recurrenceController.js'

router.get('/:id', recurrenceController.getRecurrence)
router.post('/', recurrenceController.newRecurrence)

export default router