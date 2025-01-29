import mongoose from 'mongoose'

const recurrencySchema = new mongoose.Schema({
    number: Number,
    recurrenceID: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString(),
        immutable: true
    },
    status:{
        type: String,
        required:true
    },
    currency: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required: true
    },
    transactions: []
})

export default mongoose.model('Recurrency', recurrencySchema)