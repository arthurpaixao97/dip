import authController from './authController.js'
import express from 'express'
const router = express.Router()

router.post('/authenticate', authController.authenticate)
router.post('/login', authController.login)
router.post('/logout', authController.logout)

export default router