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
                
                obj.offer = transaction.offer
                obj.buyer = transaction.buyer
                obj.paymentInfo = transaction.paymentInfo
                
                obj.mode = offer.payment.mode
                obj.frequency = offer.payment.frequency
                obj.period = offer.payment.period
                
                const creationDate = new Date().toISOString()
                obj.createdAt = dates.ISODate(creationDate)
                obj.date_next_charge = dates.addDays(obj.createdAt, offer.payment.period)
                obj.current = 0

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

        recs.push(newRec)

        await transactionServices.updateTransaction(t, {
            recurrence: {
                recurrencyNumber: newRec.number,
                recurrenceID: recurrence.id
            }
        })

        await this.updateRecurrence(r.id, {recurrencies: recs, current: recs.length})

    }

    async newRecurrency(recID)
    {
        //pull recurencies from recurrence
        //create new recurrency
        //create new transaction for new recurrency
        //push new recurrency into recurrencies array
        //update recurrence's current and date_next_charge
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