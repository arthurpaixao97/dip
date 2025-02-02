import express from 'express'
const router = express.Router()
import productController from '../controllers/productController.js'

router.get('/:id', productController.getProduct)
router.post('/', productController.newProduct)

export default router