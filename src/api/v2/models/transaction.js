import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
    id: {
        type: String,
        required:true,
        unique:true,
        immutable: true
    },
    productID: {
        type: Number,
        required:true
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()).toISOString(),
        immutable: true
    },
    status: {
        type: String,
        required:true,
        default:'INITIAL'
    },
    refusal:String,
    type:{
        type:String,
        default:'DEFAULT' //can be DEFAULT, CARD_VALIDATION, CHANGE_OFFER
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
        payment: {
            mode: {
                type: String, //SINGLE, SUBSCRIPTION, INSTALLMENT
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
        }
    },
    currency: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    buyer: {
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
    recurrence: {
        recurrencyNumber: Number,
        recurrencyID: String,
        recurrenceID: String
    },
    participants: {
        tax:{
            id:Number,
            email:String,
            perc:Number
        },
        services:[],
        promoter:{
            id:Number,
            perc:Number,
            email:String
        },
        partners:[],
        creator:{
            id:Number,
            email:String
        }
    },
    commissions:[]
})

export default mongoose.model('Transaction', transactionSchema)