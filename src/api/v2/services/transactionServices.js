import Transaction from '../models/transaction.js'
import ids from '../../../utils/ids.js'
import dates from '../../../utils/dates.js'
import fin from '../../../utils/finances.js'
import walletServices from './walletServices.js'
import userServices from './userServices.js'
import productServices from './productServices.js'
import offerServices from './offerServices.js'
import partnershipServices from './partnershipServices.js'
import promotionServices from './promotionServices.js'
import recurrenceServices from './recurrenceServices.js'
import dpayServices from './dpayServices.js'
import product from '../models/product.js'

class TransactionServices {
    async getTransaction(tid){
        const t = await Transaction.findOne({id: tid})
        return t
    }

    async getTransactions(query){
        const t = await Transaction.find(query)
        return t
    }

    async newTransaction(t)
    {
        //pull offer, product, promotion, partnerships and creator user
        const offer = await offerServices.getOffer(t.offer.id)
        const product = await productServices.getProduct(t.productID)
        const promoter = await promotionServices.getPromotion({id: t.promotionID})
        const partners = await partnershipServices.getPartnerships({productID: t.productID})
        const producer = await userServices.getUser(product.creatorID)

        //generate unique transaction ID
        const id = await ids.transactionID()
        t.id = id

        //assigns pulled offer to transaction's offer, so current offer's state is saved
        t.offer = offer

        if(t.currency == null || t.currency == undefined)
        {
            t.currency = offer.currency
        }
        if(t.price == null || t.price == undefined)
        {
            t.price = offer.price
        }

        //set participants for transaction
        t = await this.setParticipants(t, product, promoter, partners, producer)

        //set commissions based on transaction's participants
        t = await this.setCommissions(t)

        //save transaction in db
        const newTransaction = new Transaction(t)
        await newTransaction.save()

        //try to create new user for the buyer, in case they are not registered yet
        await this.tryCreateBuyerUser(newTransaction)

        //Send to DPay and wait for its return
        const finalTransaction = await dpayServices.processTransaction(newTransaction)
        return finalTransaction
    }

    async newValidationTransaction(t)
    {
        const validation = await dpayServices.processTransaction(t)
        return validation
    }

    async setParticipants(t, pd, pm, pt, pr)
    {
        //t:transaction; pd:product; pm:promotion; pt:partnerships; pr:producer

        var participants = {
            tax:{
                id: 0,
                email:"tax@dip.com",
                perc:0.1
            },
            services: [],
            promoter: null,
            partners: [],
            creator: {
                id: pr.id,
                email: pr.email
            }
        }

        //set product services participants, if any
        if(Array.isArray(pd.services) && pd.services.length > 0)
        {
            for(let i = 0; i < pd.services.length; i++)
            {
                const s = pd.services[i]
                participants.services.push({
                    id:s.id,
                    email:s.email,
                    perc:s.perc,
                    description:s.description
                })
            }
        }

        //set promoter participant, if present
        if(pm)
        {
            participants.promoter = {
                id:pm.promoterID,
                email:pm.email,
                perc:pm.commission
            }
        }

        //set partners participants, if any
        if(Array.isArray(pt) && pt.length > 0)
        {
            for(let i = 0; i < pt.length; i++)
            {
                const p = pt[i]
                participants.partners.push({
                    id:p.partnerID,
                    email:p.email,
                    perc:p.commission
                })
            }
        }

        t.participants = participants
        return t
    }

    async setCommissions(t){

        var commissions = []
        var base = t.price
        
        //Service tax
        var taxAmount = fin.money(base * t.participants.tax.perc)
        commissions.push({
            user:t.participants.tax.id,
            email:t.participants.tax.email,
            currency:t.currency,
            amount:taxAmount,
            description:"Taxa de utilização"
        })

        base -= taxAmount
        base = fin.money(base)
        
        //Product services
        var servicesAmount = 0
        if(Array.isArray(t.participants.services) && t.participants.services.length > 0)
        {
            
            for(let i = 0; i < t.participants.services.length; i++)
            {
                var s = t.participants.services[x]
                var sAmount = fin.money(s.perc * base)
                commissions.push({
                    user: s.id,
                    email: s.email,
                    currency: t.currency,
                    amount: sAmount,
                    description: s.description
                })

                servicesAmount += sAmount
            }

            if(!isNaN(servicesAmount))
            {
                base -= servicesAmount
            }
        }

        base = fin.money(base)

        //Promoter
        if(t.participants.promoter != null && t.participants.promoter != undefined)
        {
            var pAmount = fin.money(t.participants.promoter.perc * base)

            if(!isNaN(pAmount))
            {
                commissions.push({
                    user: t.participants.promoter.id,
                    email: t.participants.promoter.email,
                    currency: t.currency,
                    amount: pAmount,
                    description: "Comissão de promotor"
                })

                base -= pAmount
            }
        }

        base = fin.money(base)
        
        //Partners
        var partnersAmount = 0
        if(Array.isArray(t.participants.partners) && t.participants.partners.length > 0)
        {
            for(let i = 0; i < t.participants.partners.length; i++)
            {
                var p = t.participants.partners[i]
                var pAmount = fin.money(p.perc * base)
                if(!isNaN(pAmount))
                {
                    commissions.push({
                        user: p.id,
                        email: p.email,
                        currency: t.currency,
                        amount: pAmount,
                        description: "Comissão de parceiro"
                    })

                    partnersAmount += pAmount
                }
            }

            base -= partnersAmount
        }

        base = fin.money(base)

        var creatorAmount = base
        commissions.push({
            user: t.participants.creator.id,
            email: t.participants.creator.email,
            currency: t.currency,
            amount: fin.money(creatorAmount),
            description: "Comissão de criador"
        })

        t.commissions = commissions
        return t
    }

    async tryCreateBuyerUser(t)
    {
        try {
            await userServices.newUser({
                email: t.buyer.email,
                profile: {
                    document:t.buyer.document,
                    name:t.buyer.name,
                    publicName:t.buyer.name,
                    address:t.address,
                    phone:t.buyer.phone
                }
            })
        } catch (error) {
            
        }
    }

    async updateTransaction(tid, updates)
    {
        const newT = await Transaction.findOneAndUpdate({id: tid}, updates, {new: true})
        return newT
    }

    async updateTransactionRecurrence(t)
    {
        const offer = t.offer

        if(offer.payment.mode != 'SINGLE')
        {
            
            if(!t.recurrence.recurrenceID)
            {   
            
                if(t.status == 'APPROVED')
                {
                    await recurrenceServices.newRecurrence(t.id)
                }
            } else
            {
                if(t.type == 'CHANGE_OFFER')
                {
                    // await recurrenceServices.changeRecurrenceOffer(t)
                } else {
                    await recurrenceServices.updateRecurrencyStatus(t)
                }
            }
        }
    }

    async setPending(t)
    {
        const newT = await this.updateTransaction(t, {status: 'PENDING'})
        return newT
    }

    async approve(t)
    {
        const transaction = await this.getTransaction(t.id)

        if(transaction.status == 'APPROVED')
        {
            return transaction
        } else
        {
            const newT = await this.updateTransaction(t.id, {status: 'APPROVED'})
            await this.sendCommissions(t.id)
            if(t.recurrence.recurrenceID == undefined || t.recurrence.recurrenceID == null)
            {
                await recurrenceServices.newRecurrence(newT)
            }
            return newT
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
        return {status: 200, message:`Transaction ${t.id} refunded`}
    }
    
    async cancel(t)
    {
        const newT = await this.updateTransaction(t.id, {status: 'CANCELLED', refusal: t.refusal, recurrence: t.recurrence})
        return newT
    }

    async sendCommissions(t)
    {
        var transaction = await this.getTransaction(t)

        if(!transaction.commissions)
        {
            transaction.commissions = []
        }
        var commissions = transaction.commissions
        for(let i = 0; i < commissions.length; i++)
        {
            var c = commissions[i]
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