const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    user: {
        type: Object,
        require: true
    },
    info: {
        type: Object,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'files',
    timestamps: true
})

module.exports = mongoose.model('FileSchema', fileSchema)