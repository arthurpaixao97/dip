import promotionServices from '../services/promotionServices.js'

class PromotionController {
    async getPromotion(req, res)
    {
        try {
            const promotion = await promotionServices.getPromotion(req.query)
            res.status(200).json(promotion)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async getPromotions(req, res)
    {
        try {
            const promotions = await promotionServices.getPromotions(req.query)
            res.status(200).json(promotions)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async newPromotion(req, res)
    {
        try {
            const promotion = await promotionServices.newPromotion(req.body)
            res.status(201).json({
                status: 201,
                content:promotion
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

export default new PromotionController()