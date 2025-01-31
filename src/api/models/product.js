import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required:true,
        immutable: true
    },
    name: {
        type: String,
        required:true
    },
    description: {
        type: String
    },
    photo: {
        type: String //URL for image
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
    creatorID: {
        type: Number,
        required:true
    },
    services:{
        type:[],
        default:[]
    }
})

export default mongoose.model('Product', productSchema)