import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
    user: {
        type: Number,
        required:true
    },
    token: {
        type: String,
        required:true,
        unique:true,
        immutable: true
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()).toISOString(),
        immutable: true
    },
    expiresAt: {
        type: Date
    }
})

export default mongoose.model('Session', sessionSchema)