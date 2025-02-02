import Promotion from '../models/promotion.js'
import ids from '../../../utils/ids.js'

class PromotionServices {
    
    async newPromotion(obj)
    {
        var newPromotion = {}
        try {
            //Must check if promotion exists. If it does, actually update it
            obj.status = 'ACTIVE'
            await ids.promotionID()
            .then(async p => {
                obj.id = p
                const promotion = new Promotion(obj)
                await promotion.save()
                newPromotion = promotion
            })

            return newPromotion
        } catch (error) {
            throw error
        }
    }
    
    async getPromotion(query)
    {
        const promotion = await Promotion.findOne(query)
        return promotion
    }

    async getPromotions(query)
    {
        const promotions = await Promotion.find(query)
        return promotions
    }
}

export default new PromotionServices()