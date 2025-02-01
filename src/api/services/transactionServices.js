import Transaction from '../models/transaction.js'
import ids from '../../utils/ids.js'
import walletServices from './walletServices.js'
import userServices from './userServices.js'
import productServices from './productServices.js'
import offerServices from './offerServices.js'
import partnershipServices from './partnershipServices.js'
import promotionServices from './promotionServices.js'
import recurrenceServices from './recurrenceServices.js'
import dpayServices from './dpayServices.js'

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
        var newT = {}

        try {
            var obj = t
            obj.status = 'INITIAL'
            await ids.transactionID()
            .then(async t => {
                //Set the unique random T.ID
                obj.id = t

                //Get the dependencies for transaction creation
                const product = await productServices.getProduct(obj.productID)
                const offer = await offerServices.getOffer(obj.offerID)
                const promoter = await promotionServices.getPromotion({id: obj.promotionID})
                const partners = await partnershipServices.getPartnerships({productID: obj.productID})
                const producer = await userServices.getUser(product.creatorID)

                //Build transaction offer info
                if(obj.offer == (null || undefined))
                {
                    obj.offer = {
                        id: offer.id,
                        currency: offer.currency,
                        price: offer.price,
                        payment: offer.payment
                    }
                }
                

                //Build transaction pricing info
                obj.currency = obj.offer.currency
                obj.price = obj.offer.price

                //Prepare participants and set creator as participant
                obj.participants = {
                    partners: [],
                    creator: {
                        id: producer.id,
                        email: producer.email
                    }
                }

                //Set DiP tax participant
                obj.participants.tax = {
                    id:0,
                    email:"tax@dip.com",
                    perc:0.1
                }

                //Set product services participants, if any
                obj.participants.services = []

                if(Array.isArray(product.services) && product.services.length > 0)
                {
                    for(let x = 0; x < product.services.length; x++)
                    {
                        const serv = product.services[x]
                        obj.participants.services.push({
                            id:serv.id,
                            email:serv.email,
                            perc:serv.perc,
                            description:serv.description
                        })
                    }
                }

                //Set promoter participant, if any
                if(promoter)
                {
                    obj.participants.promoter = {
                        id:promoter.promoterID,
                        email:promoter.email,
                        perc:promoter.commission
                    }
                }

                //Set partners participants, if any
                if(Array.isArray(partners) && partners.length > 0)
                {
                    for(let z = 0; z < partners.length; z++)
                    {
                        const p = partners[z]
                        obj.participants.partners.push({
                            id:p.partnerID,
                            email:p.email,
                            perc:p.commission
                        })
                    }
                }
                
                //Save transaction
                const transaction = new Transaction(obj)
                await transaction.save()

                //Set commissions to just created transaction
                await this.setCommissions(transaction.id)

                //Fill return "newT" with new transaction data
                newT = await this.getTransaction(transaction.id)

                try {
                    await userServices.newUser({
                        email: transaction.buyer.email,
                        profile: {
                            document:transaction.buyer.document,
                            name:transaction.buyer.name,
                            publicName:transaction.buyer.name,
                            address:transaction.address,
                            phone:transaction.buyer.phone
                        }
                    })
                } catch (error) {
                    
                }
                
            })

            await dpayServices.paymentScreening(newT)
            const returnTransaction = await this.getTransaction(newT.id)
            return returnTransaction

            //Return the new transaction
            
        } catch (error) {
            throw error
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
                await recurrenceServices.updateRecurrencyStatus(t)
            }
        }
    }

    async setPending(t)
    {
        const transaction = await this.getTransaction(t)
        await this.updateTransaction(t, {status: 'PENDING'})
        await this.updateTransactionRecurrence(transaction)
        return {status: 200, message:'Success'}
    }

    async approve(t)
    {
        const transaction = await this.getTransaction(t.id)

        if(transaction.status == 'APPROVED')
        {
            return {status: 400, message:'Transação já está Aprovada.'}
        } else
        {
            const newT = await this.updateTransaction(t.id, {status: 'APPROVED', recurrence: t.recurrence})
            await this.sendCommissions(t.id)

            await this.updateTransactionRecurrence(newT)

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
        const newT = await this.updateTransaction(t.id, {status: 'CANCELLED', recurrence: t.recurrence})
        await this.updateTransactionRecurrence(newT)
        return {status: 200, message:'Success'}
    }

    async setCommissions(tid){

        //Find transaction
        const t = await this.getTransaction(tid)
        var a = t.price
        var c = []
        
        //DiP Tax
        var tax_amt = parseFloat((t.participants.tax.perc * a).toFixed(2))
        
        c.push({
            user:t.participants.tax.id,
            email:t.participants.tax.email,
            currency:t.currency,
            amount: tax_amt,
            description:"Taxa de utilização"
        })
        a -= (tax_amt).toFixed(2)
        a = parseFloat(a).toFixed(2)



        //Services fees
        if(Array.isArray(t.participants.services) && t.participants.services.length > 0)
        {
            var servicesAmount = 0
            for(let x = 0; x < t.participants.services.length; x++)
            {
                var s = t.participants.services[x]
                
                var amt = parseFloat((s.perc * a).toFixed(2))
                c.push({
                    user: s.id,
                    email: s.email,
                    currency:t.currency,
                    amount: amt,
                    description: s.description
                })
                servicesAmount += amt
            }
        }

        if(!isNaN(servicesAmount))
        {
            a -= (servicesAmount).toFixed(2)
        }
        a = parseFloat(a).toFixed(2)

      
        //Promoter
        if(t.participants.promoter.id != (null || undefined))
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
            a = parseFloat(a.toFixed(2)).toFixed(2)
        }
       
        //Partners
        var partnersAmount = 0
        if(Array.isArray(t.participants.partners) && t.participants.partners.length > 0)
        {
            
            for(let x = 0; x < t.participants.partners.length; x++)
            {
                var p = t.participants.partners[x]
                
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
        a = parseFloat(a).toFixed(2)
        
        //Creator
        c.push({
            user: t.participants.creator.id,
            email: t.participants.creator.email,
            currency:t.currency,
            amount: parseFloat(a).toFixed(2),
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