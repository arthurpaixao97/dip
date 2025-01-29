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
        default: new Date().toISOString(),
        immutable: true
    },
    expiresAt: {
        type: Date
    },
    role: {
        type: String
    },
    permissions: {
        type: [String]
    }
})

export default mongoose.model('Session', sessionSchema)