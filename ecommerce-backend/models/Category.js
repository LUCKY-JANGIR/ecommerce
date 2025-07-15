const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 500
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
