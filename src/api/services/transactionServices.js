import Transaction from '../models/transaction.js'
import ids from '../../utils/ids.js'
import walletServices from './walletServices.js'
import userServices from './userServices.js'
import productServices from './productServices.js'
import offerServices from './offerServices.js'
import partnershipServices from './partnershipServices.js'
import promotionServices from './promotionServices.js'
import recurrenceServices from './recurrenceServices.js'

class TransactionServices {
    async getTransaction(tid){
        const t = await Transaction.findOne({id: tid})
        return t
    }

    async getTransactions(query){
        const t = await Transaction.find(query)
        return t
    }

    async newTransaction(obj)
    {
        var newT = {}

        try {
            obj.status = 'INITIAL'
            await ids.transactionID()
            .then(async t => {
                obj.id = t
                const product = await productServices.getProduct(obj.productID)
                const offer = await offerServices.getOffer(obj.offerID)
                const partners = await partnershipServices.getPartnerships({productID: obj.productID})
                const producer = await userServices.getUser(product.creatorID)
                obj.offer = {
                    id: offer.id,
                    currency: offer.currency,
                    price: offer.price
                },
                obj.currency = offer.currency
                obj.price = offer.price
                obj.participants = {
                    partners: [],
                    creator: {
                        id: producer.id,
                        email: producer.email
                    }
                }
                for(let z = 0; z < partners.length; z++)
                {
                    const p = partners[z]
                    obj.participants.partners.push({
                        id:p.partnerID,
                        email:p.email,
                        perc:p.commission
                    })
                }
                const transaction = new Transaction(obj)
                await transaction.save()
                await this.setCommissions(transaction.id)
                newT = await this.getTransaction(transaction.id)
            })

            return newT
        } catch (error) {
            throw error
        }
    }

    async updateTransaction(tid, updates)
    {
        await Transaction.findOneAndUpdate({id: tid}, updates, {new: true})
        .then(t => {
            return t
        })
    }

    async setPending(t)
    {
        await this.updateTransaction(t, {status: 'PENDING'})
        return {status: 200, message:'Success'}
    }

    async approve(t)
    {
        const transaction = await this.getTransaction(t)

        if(transaction.status == 'APPROVED')
        {
            return {status: 400, message:'Transação já está Aprovada.'}
        } else
        {
            const offer = await offerServices.getOffer(transaction.offer.id)
            await this.updateTransaction(t, {status: 'APPROVED'})
            await this.sendCommissions(t)

            if(!transaction.recurrence.recurrenceID && offer.payment.mode != 'SINGLE')
            {
                await recurrenceServices.newRecurrence(t)
            }

            return {status: 200, message:'Success'}
        }
    }

    async complete(t)
    {
        
    }

    async protest(t)
    {
        
    }

    async refund(t)
    {
        await this.updateTransaction(t, {status: 'REFUNDED'})
        await this.removeCommissions(t)
        return {status: 200, message:'Success'}
    }
    
    async cancel(t)
    {
        await this.updateTransaction(t, {status: 'CANCELLED'})
        return {status: 200, message:'Success'}
    }

    async setCommissions(tid){
        const t = await this.getTransaction(tid)
        var a = t.price
        var c = []

        c.push({
            user:0,
            email:"tax@dip.com",
            currency:t.currency,
            amount: parseFloat((0.1 * a).toFixed(2)),
            description:"Taxa de utilização"
        })
        a -= (0.1 * a).toFixed(2)
        a = parseFloat(a)

        if(t.participants.promoter != (null || undefined))
        {
            c.push({
                user: t.participants.promoter.id,
                email: t.participants.promoter.email,
                currency:t.currency,
                amount: parseFloat((t.participants.promoter.perc * a).toFixed(2)),
                description: "Comissão de promotor"
            })

            if(!isNaN(t.participants.promoter.perc * a))
            {
                a -= t.participants.promoter.perc * a
            }
            a = parseFloat(a.toFixed(2))
        }

        if(Array.isArray(t.participants.partners))
        {
            var partnersAmount = 0
            for(let x = 0; x < t.participants.partners.length; x++)
            {
                var p = t.participants.partners[x]
                console.log(a)
                var amt = parseFloat((p.perc * a).toFixed(2))
                c.push({
                    user: p.id,
                    email: p.email,
                    currency:t.currency,
                    amount: amt,
                    description: "Comissão de parceiro"
                })
                partnersAmount += amt
            }
        }

        a -= partnersAmount

        c.push({
            user: t.participants.creator.id,
            email: t.participants.creator.email,
            currency:t.currency,
            amount: parseFloat((a).toFixed(2)),
            description: "Comissão de criador"
        })

        await this.updateCommissions(t, c)
    }

    async updateCommissions(t, c)
    {
        await Transaction.findOneAndUpdate({id: t.id}, {commissions: c}, {new: true})
        .then(t => {
            return t
        })
    }

    async sendCommissions(t)
    {
        var transaction = await this.getTransaction(t)

        if(!transaction.commissions)
        {
            transaction.commissions = []
        }
        var commissions = transaction.commissions
        for(let y = 0; y < commissions.length; y++)
        {
            var c = commissions[y]
            await walletServices.addBalance({
                user: c.user,
                currency: c.currency,
                amount: c.amount,
                description: c.description,
                transaction: transaction.id
            })
        }
    }

    async removeCommissions(t)
    {
        var transaction = await this.getTransaction(t)

        if(!transaction.commissions)
        {
            transaction.commissions = []
        }
        var commissions = transaction.commissions
        commissions.foreach(c => {
            walletServices.addBalance({
                user: c.user,
                currency: c.currency,
                amount: c.amount * -1,
                description: `Reembolso ${c.description}`,
                transaction: transaction.id
            })
        })
    }
}

export default new TransactionServices()