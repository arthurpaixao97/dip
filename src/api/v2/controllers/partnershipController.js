import partnershipServices from '../services/partnershipServices.js'

class PartnershipController {
    async getPartnership(req, res)
    {
        try {
            const partnership = await partnershipServices.getPartnership(query)
            res.status(200).json(partnership)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async getPartnerships(req, res)
    {
        try {
            const partnerships = await partnershipServices.getPartnership(query)
            res.status(200).json(partnerships)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async newPartnership(req, res)
    {
        try {
            const partnership = await partnershipServices.newPartnership(req.body)
            res.status(201).json({
                status: 201,
                partnership:partnership
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

export default new PartnershipController()