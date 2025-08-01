const mongoose = require('mongoose');

const platformReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PlatformReview', platformReviewSchema);