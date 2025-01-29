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
        default: new Date().toISOString(),
        immutable: true
    },
    status: {
        type: String,
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
        recurrenceID: String
    },
    participants: {
        promoter:{
            id:Number,
            perc:Number
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