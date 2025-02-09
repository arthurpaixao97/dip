import Offer from '../models/offer.js'
import productServices from './productServices.js'
import ids from '../../../utils/ids.js'

class OfferServices {
    async newOffer(obj)
    {
        var newOffer = {}

        const product = await productServices.getProduct(obj.productID)
        if(product)
        {
            try {
                obj.status = 'ACTIVE'
                await ids.offerID()
                .then(async i => {
                    obj.id = i
                    const offer = new Offer(obj)
                    await offer.save()
                    newOffer = offer
                })
                return {status:201,offer:newOffer}
            } catch (error) {
                throw error
            }
        } else
        {
            return {status: 404, message: 'Produto não encontrado'}
        }

        
    }

    async getOffer(oid)
    {
        const offer = await Offer.findOne({id: oid})
        return offer
    }

    async getOffers(query)
    {
        const offers = await Offer.find(query)
        return offers
    }

    async deactivateOffer(oid)
    {
        await Offer.findOneAndUpdate({id: oid}, {status:'INACTIVE'}, {new:true})
        .then(o => {
            return o
        })
    }

    async activateOffer(oid)
    {
        await Offer.findOneAndUpdate({id: oid}, {status:'ACTIVE'}, {new:true})
        .then(o => {
            return o
        })
    }

    async updateOffer(oid, updates)
    {
        await Offer.findOneAndUpdate({id: oid}, updates, {new:true})
        .then(o => {
            return o
        })
    }
}

export default new OfferServices()