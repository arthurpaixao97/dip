import express from 'express'
const router = express.Router()
import walletRoutes from './routes/walletRoutes.js'
import userRoutes from './routes/userRoutes.js'
import offerRoutes from './routes/offerRoutes.js'
import partnershipRoutes from './routes/partnershipRoutes.js'
import promotionRoutes from './routes/promotionRoutes.js'
import productRoutes from './routes/productRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import recurrenceRoutes from './routes/recurrenceRoutes.js'
import roleRoutes from './routes/roleRoutes.js'

router.use('/wallet', walletRoutes)
router.use('/users', userRoutes)
router.use('/offers', offerRoutes)
router.use('/products', productRoutes)
router.use('/partners', partnershipRoutes)
router.use('/promoters', promotionRoutes)
router.use('/transactions', transactionRoutes)
router.use('/recurrences', recurrenceRoutes)
router.use('/roles', roleRoutes)

export default router