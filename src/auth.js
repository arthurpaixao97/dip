import express from 'express'
const router = express.Router()

import authRouter from './auth/authRoutes.js'

router.use('/', authRouter)

export default router