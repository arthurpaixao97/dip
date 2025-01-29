import express from 'express'
const router = express.Router()
import userController from '../controllers/userController.js'


router.get('/:id', userController.getUser)
router.get('/', userController.getUsers)
router.post('/', userController.newUser)

export default router