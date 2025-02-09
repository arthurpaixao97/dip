import express from 'express'
const router = express.Router()
import userController from '../controllers/userController.js'
import mw_auth from '../../../middlewares/auth.js'


router.get('/:id', userController.getUser)
router.get('/', await mw_auth.authRole('ADMIN'), userController.getUsers)
router.post('/', userController.newUser)

export default router