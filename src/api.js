import express from 'express'
const router = express.Router()
import v2 from './api/v2/index.js'
router.use('/v2', v2)

export default router