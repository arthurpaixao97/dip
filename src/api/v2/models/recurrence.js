import mongoose from 'mongoose'

const recurrenceSchema = new mongoose.Schema({
    id: {
        type:String,
        required:true,
        unique:true,
        immutable: true
    },
    productID: {
        type:Number,
        required:true
    },
    offer: {
        id:{
            type:String,
            required:true
        },
        currency: {
            type:String,
            required:true
        },
        price: {
            type:Number,
            required:true
        },
        mode: {
            type: String, //SUBSCRIPTION, INSTALLMENT
            required:true
        },
        frequency: {
            type: Number, //-1 for undefined times, 1 for single payment, >1 for number of payments
            required:true
        },
        period: {
            type: Number, //0 for single payment, 7 for weekly, 30 for monthly, 60 for bimonthly, 90 for quarterly, 180 for semiannual, 365 for annual, >365 for number of years
            required:true
        }
    },
    recurrencies: {
        type:[]
    },
    current:{
        number:{
            type:Number
        },
        id:{
            type:String
        }
    },
    status:{
        type:String,
        required:true
    },
    buyer:{
        email: {
            type: String,
            required:true
        },
        document: String,
        name: {
            type: String,
            required:true
        },
        phone: {
            countryCode: Number,
            areaCode: Number,
            number: Number
        },
        address: {
            country: String,
            zip: String,
            state: String,
            city: String,
            neighborhood: String,
            street: String,
            number: String,
            complement: String,
        }
    },
    paymentInfo: {
        method: {
            type: String
        },
        gateway: {
            type: String
        },
        details: {
            type: Object
        }
    },
    date_next_charge: Date,
    createdAt: {
        type: Date,
        default: new Date(Date.now()).toISOString(),
        immutable: true
    },
    nextRecurrency: Object,
    promotionID:String
})

export default mongoose.model('Recurrence', recurrenceSchema)