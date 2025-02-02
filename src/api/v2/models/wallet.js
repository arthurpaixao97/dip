import mongoose from 'mongoose'

const walletSchema = new mongoose.Schema({
    userID: {
        type: Number,
        required: true
    },
    balance: {
        BRL: Number,
        USD: Number,
        EUR: Number,
        GBP: Number
    },
    statement:[]
})

export default mongoose.model('Wallet', walletSchema)