import Recurrence from '../models/recurrence.js'
import Recurrency from '../models/recurrency.js'
import transactionServices from './transactionServices.js'
import offerServices from './offerServices.js'
import ids from '../../../utils/ids.js'
import dates from '../../../utils/dates.js'

class RecurrenceServices {
    
    //RECURRENCE CRUD

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

        await this.updateRecurrence(r.recurrenceID, {status: newStatus})
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

    //RECURRENCY CRUD

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