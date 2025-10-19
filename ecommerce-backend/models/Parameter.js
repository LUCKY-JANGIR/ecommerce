const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['select', 'text', 'number', 'custom-range', 'dimensions']
    },
    options: [{
        type: String,
        trim: true
    }],
    required: {
        type: Boolean,
        default: false
    },
    unit: {
        type: String,
        trim: true
    },
    min: {
        type: Number
    },
    max: {
        type: Number
    },
    step: {
        type: Number,
        default: 1
    },
    allowCustom: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster lookups
parameterSchema.index({ name: 1 });
parameterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Parameter', parameterSchema);

