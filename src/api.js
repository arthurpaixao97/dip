import express from 'express'
const router = express.Router()
import v1 from './api/v1/index.js'
import mw_auth from './middlewares/auth.js'


router.use('/v1', mw_auth.authAPI, v1)

export default router