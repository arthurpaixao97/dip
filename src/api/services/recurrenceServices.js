import Recurrence from '../models/recurrence.js'
import Recurrency from '../models/recurrency.js'
import transactionServices from './transactionServices.js'
import offerServices from './offerServices.js'
import ids from '../../utils/ids.js'
import dates from '../../utils/dates.js'

class RecurrenceServices {

    async newRecurrence(t)
    {
        var newRec = {}

        try {
            var obj = {}
            obj.status = 'ACTIVE'
            await ids.recurrenceID()
            .then(async r => {
                obj.id = r
                const transaction = await transactionServices.getTransaction(t)
                const offer = await offerServices.getOffer(transaction.offer.id)
                
                obj.productID = transaction.productID
                obj.offer = transaction.offer
                obj.buyer = transaction.buyer
                obj.paymentInfo = transaction.paymentInfo
                
                obj.mode = offer.payment.mode
                obj.frequency = offer.payment.frequency
                obj.period = offer.payment.period
                
                const creationDate = new Date().toISOString()
                obj.createdAt = dates.ISODate(creationDate)
                obj.date_next_charge = dates.addDays(obj.createdAt, offer.payment.period)
                obj.current = {
                    number:0,
                    id:''
                }

                obj.promotionID = transaction.promotionID

                const recurrence = new Recurrence(obj)
                await recurrence.save()
                newRec = recurrence
                await this.firstRecurrency(recurrence, transaction)
            })
            return newRec
        } catch (error) {
            throw error
        }
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

    async cancelRecurrence(rid)
    {

    }

    async activateRecurrence(rid)
    {

    }

    async firstRecurrency(r, t)
    {
        //r is recurrenceID, t is ID of transaction that created r

        const recurrence = r
        const transaction = t

        var recs = recurrence.recurrencies

        var recurrency = {
            number: 1,
            recurrenceID: recurrence.id,
            currency: recurrence.offer.currency,
            price: recurrence.offer.price,
            transactions:[]
        }

        recurrency.transactions.push(transaction.id)

        recurrency.status = 'SETTLED'

        const newRec = new Recurrency(recurrency)
        await newRec.save()

        recs.push({id:newRec._id, number:newRec.number})

        var tUpdates = transaction

        tUpdates.recurrence = {
            recurrencyNumber: newRec.number,
            recurrencyID: newRec._id,
            recurrenceID: recurrence.id
        }

        await transactionServices.updateTransaction(t.id, tUpdates)

        //TODO: Set recurrence's nextRecurrency

        await this.updateRecurrence(r.id, {recurrencies: recs, current: {number:recs.length, id:newRec._id}})

    }

    async newRecurrency(recID)
    {
        //TODO:
        //
        //pull recurencies from recurrence
        const recurrence = await this.getRecurrence(recID)
        var recs = recurrence.recurrencies
        //create new recurrency
        var recurrency = {
            number: recurrence.current.number + 1,
            recurrenceID: recurrence.id,
            status:'OPEN',
            currency: recurrence.offer.currency,
            price: recurrence.offer.price,
            transactions:[]
        }

        const newRec = new Recurrency(recurrency)
        await newRec.save()

        recs.push({id: newRec._id, number: newRec.number})
        //Update recurrence's current and recurrencies list
        const newRecurrence = await this.updateRecurrence(recurrence.id,{
            current:{
                id:newRec._id,
                number: newRec.number
            },
            recurrencies: recs
        })

        await this.addDaysToNextCharge(recurrence.id, recurrence.period)

        //create new transaction for new recurrency
        const newT = await this.newRecurrencyTransaction(recurrence.id)
        //update recurrence's nextRecurrency

        return newRec
    }

    async newRecurrencyTransaction(recID)
    {
        const recurrence = await this.getRecurrence(recID)
        const cur = recurrence.current
        const recurrency = await this.getRecurrency(cur.id)

        var t = {
            //new transaction content
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

    async recurrencyNewCharge(ryid)
    {
        const recurrency = await this.getRecurrency(ryid)
        const recurrence = await this.getRecurrence(recurrency.recurrenceID)
        
        if(recurrency.status == 'SETTLED')
        {
            throw new Error("Recorrência já está paga.");
            
        } else
        {
            var t = {
                //new transaction content
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
                    recurrencyNumber: recurrency.number,
                    recurrencyID: ryid,
                    recurrenceID: recurrence.id
                },
                buyer: recurrence.buyer,
                paymentInfo: recurrence.paymentInfo
            }
            
            const newT = await transactionServices.newTransaction(t)
    
            //push transaction into recurrency transactions
            var newRecurrency = recurrency
            newRecurrency.transactions.push(newT.id)
            //update recurrency
            const newRec = await Recurrency.findOneAndUpdate({_id: ryid}, {transactions: recurrency.transactions}, {new: true})
    
            await this.updateRecurrencyStatus(newT)
            console.log(newT)
            return newT
        }
    }

    async getRecurrency(rid)
    {
        const recurrency = await Recurrency.findById(rid)
        return recurrency
    }

    async updateRecurrencyStatus(t)
    {
        if(t.status == 'APPROVED' || t.status == 'COMPLETE')
        {
            const newRecurrency = await Recurrency.findOneAndUpdate({_id: t.recurrence.recurrencyID}, {status: 'SETTLED'}, {new: true})
            console.log(newRecurrency)
        } 
        if(t.status == 'CANCELLED')
        {
            const recurrency = await this.getRecurrency(t.recurrence.recurrencyID)
            if(recurrency.status != 'SETTLED')
            {
                const newRecurrency = await Recurrency.findOneAndUpdate({_id: t.recurrence.recurrencyID}, {status: 'DELAYED'}, {new: true})
                console.log(newRecurrency)
            }
        }
    }

    async updateRecurrenceStatus(r)
    {
        //r is full recurrency
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

}

export default new RecurrenceServices()