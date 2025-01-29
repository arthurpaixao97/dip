import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required:true,
        unique:true,
        immutable: true
    },
    email: {
        type: String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString(),
        immutable: true
    },
    lastLogin: {
        type: Date
    },
    profile: {
        document: {
            type: String
        },
        birthdate: {
            type: Date
        },
        name: {
            type: String,
            required:true
        },
        publicName: {
            type: String
        },
        photo: {
            type: String //URL for image
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
        },
        phone: {
            countryCode: Number,
            areaCode: Number,
            number: Number
        }
    },
    role: {
        type: String,
        default: 'CLIENT'
    },
    permissions: [String]
})

export default mongoose.model('User', userSchema)