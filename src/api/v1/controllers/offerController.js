import offerServices from '../services/offerServices.js'

class OfferController {
    async getOffer(req, res)
    {
        try {
            const offer = await offerServices.getOffer(req.params.id)
            res.status(200).json(offer)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async newOffer(req, res)
    {
        try {
            const offer = await offerServices.newOffer(req.body)
            res.status(offer.status).send({
                status: (offer.status),
                content:offer
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

export default new OfferController()