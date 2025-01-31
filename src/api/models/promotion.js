import mongoose from 'mongoose'

const promotionSchema = new mongoose.Schema({
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
    promoterID: {
        type: Number,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    status: {
        type: String,
        required:true
    },
    commission: {
        type: Number,
        required:true
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString(),
        immutable: true
    }
})

export default mongoose.model('Promotion', promotionSchema)