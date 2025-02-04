import Recurrence from '../models/recurrence.js'
import Recurrency from '../models/recurrency.js'
import transactionServices from './transactionServices.js'
import offerServices from './offerServices.js'
import walletServices from './walletServices.js'
import ids from '../../../utils/ids.js'
import dates from '../../../utils/dates.js'
import fin from '../../../utils/finances.js'
import userServices from './userServices.js'

class RecurrenceServices {
    
    //RECURRENCE FUNCTIONS

    async newRecurrence(t)
    {
        //t is a full transaction

        const id = await ids.recurrenceID()

        var newRecurrence = {
            id: id,
            productID: t.productID,
            status:'ACTIVE',
            offer: {
                id: t.offer.id,
                currency: t.offer.currency,
                price: t.offer.price,
                mode: t.offer.payment.mode,
                frequency: t.offer.payment.frequency,
                period: t.offer.payment.period,
            },
            paymentInfo: t.paymentInfo,
            promotionID: t.promotionID,
            current:{
                number:0,
                id:''
            },
            buyer: t.buyer
        }

        newRecurrence.nextRecurrency = {
            number: newRecurrence.current.number + 1,
            recurrenceID: newRecurrence.id,
            status:'OPEN',
            offer: newRecurrence.offer,
            currency: newRecurrence.offer.currency,
            price: newRecurrence.offer.price,
            transactions:[]
        }

        const recurrence = new Recurrence(newRecurrence)
        await recurrence.save()
        await this.newRecurrency({
            recID: recurrence.id,
            originTransaction: t
        })

        return recurrence
    }

    async getRecurrence(rid)
    {
        const recurrence = await Recurrence.findOne({id: rid})
        return recurrence
    }

    async getRecurrences(query)
    {
        const recurrences = await Recurrence.find(query)
        return recurrences
    }

    async updateRecurrence(rid, updates)
    {
        const r = await Recurrence.findOneAndUpdate({id: rid}, updates, {new: true})
        return r
    }

    async updateRecurrenceStatus(r)
    {
        //r is full recurrency
        var newStatus = ''

        if(r.status == 'SETTLED' || r.status == 'OPEN')
        {
            newStatus = 'ACTIVE'
        } else {
            newStatus = 'DELAYED'
        }
        const newRecurrence = await this.updateRecurrence(r.recurrenceID, {status: newStatus})
        return newRecurrence
    }

    async updateRecurrenceCurrent(r)
    {
        //r is full recurrency
        const current = {
            number: r.number,
            id: r._id
        }

        await this.updateRecurrence(r.recurrenceID, {current: current})
    }

    async cancelRecurrence(rid)
    {

    }

    async activateRecurrence(rid)
    {

    }

    async addToRecurrenciesList(re, ry)
    {
        //re is the full recurrence and ry is the full recurrency
        re.recurrencies.push(ry.id)
        await this.updateRecurrence(re.id, {recurrencies: re.recurrencies})
    }

    async updateRecurrenceOffer(re, o)
    {
        //re is the full recurrence and o is the new offer to be inserted
        await this.updateRecurrence(re.id, {offer: o})
    }

    async updateNextRecurrency(re)
    {
        //pull recurrence's current state
        const recurrence = await this.getRecurrence(re.id)
        //create next recurrency, accessing the current recurrency info
        var recurrency = {
            number: recurrence.current.number + 1,
            recurrenceID: recurrence.id,
            status:'OPEN',
            offer: recurrence.offer,
            currency: recurrence.offer.currency,
            price: recurrence.offer.price,
            transactions:[]
        }

        await this.updateRecurrence(recurrence.id,{nextRecurrency: recurrency})
    }

    async addDaysToNextCharge(rid, days)
    {
        const recurrence = await this.getRecurrence(rid)
        await this.updateRecurrence(rid, {date_next_charge: dates.addDays(recurrence.date_next_charge, days)})
        .then(r => {
            return r
        })
    }

    async setNewNextCharge(rid, date)
    {
        if(new Date().getTime() < new Date(date).getTime())
        {
            await this.updateRecurrence(rid, {date_next_charge: date})
            .then(r => {
                return r
            })
        } else
        {
            throw new Error('New Date Next Charge must be after current datetime.')
        }
    }

    validateOfferChange(r, o)
    {
        //r is full recurrence, o is full offer
        
        //conditions for valid offer change
        try {
            var criteria = []
            //push criteria into criteria array
            criteria.push(o.payment.mode == r.offer.mode)

            var result = true
            //test if the whole array is true, if any false, return false
            criteria.forEach(c => {
                if(!c)
                {
                    result = false
                }
            })

            //if code reaches here, all is true, return true
            return result
        } catch (error) {
            return false
        }
    }

    //RECURRENCE TASKS

    async changeRecurrenceOfferScheduled(r, o)
    {
        //r is the recurrence ID, o is the new offer
        if(typeof o == typeof 'string')
        {
            o = await offerServices.getOffer(o)
        }
        const recurrence = await this.getRecurrence(r)

        if(!this.validateOfferChange(recurrence, o))
        {
            throw new Error("Invalid offer change");
        }

        var newNextRecurrency = recurrence.nextRecurrency
        newNextRecurrency.offer = {
            id: o.id,
            currency: o.currency,
            price: o.price,
            mode: o.payment.mode,
            frequency: o.payment.frequency,
            period: o.payment.period
        }

        newNextRecurrency.currency = o.currency
        newNextRecurrency.price = o.price

        const newRecurrence = await this.updateRecurrence(r, {nextRecurrency: newNextRecurrency})
        return newRecurrence
    }

    async changeRecurrenceOfferImediate(r, o)
    {
        if(typeof o == typeof 'string')
        {
            o = await offerServices.getOffer(o)
        }
        //r is the recurrence ID, o is the new offer
        const recurrence = await this.getRecurrence(r)

        if(!this.validateOfferChange(recurrence, o))
        {
            throw new Error("Invalid offer change");
        }

        const recurrency = await this.getRecurrency(recurrence.current.id)
        var buyer = await userServices.getUsers({email: recurrence.buyer.email})
        buyer = buyer[0]

        var dailyPrice = fin.money(recurrence.offer.price / recurrence.offer.period)
        var daysNotUsed = parseInt(recurrence.offer.period - dates.daysBetweenDates(recurrency.createdAt, dates.ISODate(Date.now()))) + 1
        var proportionalDiscount = fin.money(dailyPrice * daysNotUsed)
        var finalPrice = fin.money(o.price - proportionalDiscount)

        if(finalPrice < 0)
        {
            await walletServices.addBalance({
                user: buyer.id,
                currency: recurrence.offer.currency,
                amount: finalPrice * (-1),
                description: `Saldo positivo de troca de oferta - recorrência ${recurrence.id}`
            })

            finalPrice = 0
        }

        var t = {
            productID: recurrence.productID,
            type: 'CHANGE_OFFER',
            offer: o,
            currency: o.currency,
            price: finalPrice,
            buyer: recurrence.buyer,
            paymentInfo: recurrence.paymentInfo,
            promotionID: recurrence.promotionID,
            recurrence:{
                recurrenceID: recurrence.id
            }
        }

        const newT = await transactionServices.newTransaction(t)

        if(newT.status == 'APPROVED')
        {
            var newNextRecurrency = recurrence.nextRecurrency
            newNextRecurrency.offer = {
                id: o.id,
                currency: o.currency,
                price: o.price,
                mode: o.payment.mode,
                frequency: o.payment.frequency,
                period: o.payment.period
            }

            newNextRecurrency.currency = newT.currency
            newNextRecurrency.price = newT.price

            await this.updateRecurrence(r, {nextRecurrency: newNextRecurrency})
            await this.newRecurrency({
                recID: recurrence.id,
                originTransaction: newT
            })
        }
    }

    async changeRecurrencePaymentInfo(r, p)
    {
        var ret = null
        //r is the recurrence ID, p is the new paymentInfo object
        if(p.method == 'CREDIT_CARD')
        {
            const validation = await transactionServices.newValidationTransaction({
                type: 'CARD_VALIDATION',
                paymentInfo: p
            })

            if(validation.validationStatus == 'AUTHORISED')
            {
                const recurrence = await this.updateRecurrence(r, {paymentInfo: p})
                ret = recurrence
            } else {
                ret = {status: 400, message: 'Cartão recusado'}
            }
        } else {
            const recurrence = await this.updateRecurrence(r, {paymentInfo: p})
            ret = recurrence
        }
        
        return ret
    }

    //RECURRENCY FUNCTIONS

    async newRecurrency(query)
    {
        var ret = null
        var rec = null
        //pull recurrence
        const recurrence = await this.getRecurrence(query.recID)

        //create new recurrency from recurrence's nextRecurrency
        const newRecurrency = new Recurrency(recurrence.nextRecurrency)
        await newRecurrency.save()

        rec = newRecurrency

        //update recurrence's recurrencies list
        await this.addToRecurrenciesList(recurrence, newRecurrency)

        //update recurrence's current
        await this.updateRecurrenceCurrent(newRecurrency)

        //update recurrence's offer according to this recurrency's offer
        await this.updateRecurrenceOffer(recurrence, newRecurrency.offer)

        //update recurrence's nextRecurrency according to recurrence's offer
        await this.updateNextRecurrency(recurrence)

        //If originTransaction.id is not present, charge itself
        if(!query.originTransaction)
        {
            //If there is no originTransaction (eg. common renewal), then recurrency should create a new charge
            const newTransaction = await this.recurrencyNewCharge(rec)
            ret = newTransaction
        } else {
            //If there is an originTransaction, then recurrency should be SETTLED
            const newT = await this.addTransactionToRecurrency(rec, query.originTransaction)
            rec = await this.updateRecurrencyStatus(newT)
        }

        //update recurrence's status
        await this.updateRecurrenceStatus(rec)

        return ret
    }

    async getRecurrency(rid)
    {
        const recurrency = await Recurrency.findById(rid)
        return recurrency
    }

    async updateRecurrency(rid, update)
    {
        const newRecurrency = await Recurrency.findOneAndUpdate({_id: rid}, update, {new: true})
        return newRecurrency
    }

    async updateRecurrencyStatus(t)
    {
        var ret = {}

        if(t.status == 'APPROVED' || t.status == 'COMPLETE')
        {
            const newRecurrency = await Recurrency.findOneAndUpdate({_id: t.recurrence.recurrencyID}, {status: 'SETTLED'}, {new: true})
            ret = newRecurrency
        } 
        if(t.status == 'CANCELLED')
        {
            const recurrency = await this.getRecurrency(t.recurrence.recurrencyID)
            if(recurrency.status != 'SETTLED')
            {
                const newRecurrency = await Recurrency.findOneAndUpdate({_id: t.recurrence.recurrencyID}, {status: 'DELAYED'}, {new: true})
                ret = newRecurrency
            }
        }

        //update recurrence's status
        await this.updateRecurrenceStatus(ret)
        return ret
    }

    async addTransactionToRecurrency(r, t)
    {
        //r is a full recurrency and t is a full transaction
        r.transactions.push(t.id)
        await this.updateRecurrency(r.id, {transactions: r.transactions})
        await transactionServices.updateTransaction(t.id, {
            recurrence: {
                recurrencyNumber: r.number,
                recurrencyID: r._id,
                recurrenceID: r.recurrenceID
            }
        })
        const transaction = await transactionServices.getTransaction(t.id)
        return transaction
    }

    async newRecurrencyTransaction(re)
    {
        //re is the full recurrence
        const recurrence = re
        const cur = recurrence.current
        const recurrency = await this.getRecurrency(cur.id)

        var t = {
            //new transaction content
            type:'DEFAULT',
            productID: recurrence.productID,
            offerID: recurrence.offer.id,
            offer: {
                id: recurrence.offer.id,
                currency: recurrence.offer.currency,
                price: recurrence.offer.price,
                payment:{
                    mode: recurrence.mode,
                    frequency: recurrence.frequency,
                    period: recurrence.period
                }
            },
            promotionID: recurrence.promotionID,
            recurrence:{
                recurrencyNumber: cur.number,
                recurrencyID: cur.id,
                recurrenceID: recurrence.id
            },
            buyer: recurrence.buyer,
            paymentInfo: recurrence.paymentInfo
        }
        
        const newT = await transactionServices.newTransaction(t)

        //push transaction into recurrency transactions
        recurrency.transactions.push(newT.id)
        //update recurrency
        const newRec = await Recurrency.findOneAndUpdate({_id: cur.id}, {transactions: recurrency.transactions}, {new: true})

        return newT
    }

    async recurrencyNewCharge(r)
    {
        //r is a full recurrency
        if(typeof r == typeof 'string')
        {
            r = await this.getRecurrency(r)
        }
        const recurrence = await this.getRecurrence(r.recurrenceID)
        var newTransaction = {
            productID: recurrence.productID,
            offer: {
                id: recurrence.offer.id,
                currency: recurrence.offer.currency,
                price: recurrence.offer.price,
                payment: {
                    mode: recurrence.offer.mode,
                    frequency: recurrence.offer.frequency,
                    period: recurrence.offer.period
                },
            },
            currency: r.currency,
            price: r.price,
            buyer: recurrence.buyer,
            paymentInfo: recurrence.paymentInfo,
            promotionID: recurrence.promotionID,
            recurrence:{
                recurrencyNumber: r.number,
                recurrencyID: r._id,
                recurrenceID: recurrence.id
            }
        }

        const t = await transactionServices.newTransaction(newTransaction)

        await this.addTransactionToRecurrency(r, t)
        await this.updateRecurrencyStatus(t)

        return t
    }
}

export default new RecurrenceServices()