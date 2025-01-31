import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required:true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        required:true
    },
    currency: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    duration: {
        type: Date
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
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()).toISOString(),
        immutable: true
    }
})

export default mongoose.model('Offer', offerSchema)