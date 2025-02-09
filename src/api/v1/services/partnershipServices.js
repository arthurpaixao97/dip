import Partnership from '../models/partnership.js'
import userServices from './userServices.js'

class PartnershipServices {
    
    async newPartnership(obj)
    {
        try {
            obj.status = 'ACTIVE'
            const user = await userServices.getUser(obj.partnerID)
            obj.email = user.email
            const partnership = new Partnership(obj)
            await partnership.save()
            return partnership
        } catch (error) {
            throw error
        }
    }
    async getUPPartnership(u, p)
    {
        const partnership = await Partnership.findOne({partnerID: u, productID: p, status: 'ACTIVE'})
        return partnership
    }

    async getAllUserPartnerships(pid)
    {
        const partnership = await Partnership.find({partnerID: pid})
        return partnership
    }

    async getPartnership(query)
    {
        const partnership = await Partnership.findOne(query)
        return partnership
    }

    async getPartnerships(query)
    {
        const partnerships = await Partnership.find(query)
        return partnerships
    }
}

export default new PartnershipServices()