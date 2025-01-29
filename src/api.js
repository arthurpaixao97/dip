import express from 'express'
const router = express.Router()
import walletRoutes from './api/routes/walletRoutes.js'
import userRoutes from './api/routes/userRoutes.js'
import offerRoutes from './api/routes/offerRoutes.js'
import partnershipRoutes from './api/routes/partnershipRoutes.js'
import promotionRoutes from './api/routes/promotionRoutes.js'
import productRoutes from './api/routes/productRoutes.js'
import transactionRoutes from './api/routes/transactionRoutes.js'
import recurrenceRoutes from './api/routes/recurrenceRoutes.js'
import roleRoutes from './api/routes/roleRoutes.js'

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