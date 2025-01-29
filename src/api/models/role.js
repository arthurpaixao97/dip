import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        unique:true
    },
    permissions: []
})

export default mongoose.model('Role', roleSchema)