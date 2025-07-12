const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema); 