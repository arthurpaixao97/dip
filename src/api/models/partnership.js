import mongoose from 'mongoose'

const partnershipSchema = new mongoose.Schema({
    productID: {
        type: Number,
        required:true
    },
    partnerID: {
        type: Number,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    permissions: {
        type: [String]
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

export default mongoose.model('Partnership', partnershipSchema)