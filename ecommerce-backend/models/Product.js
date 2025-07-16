const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        url: String,
        alt: String
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    specifications: [{
        name: String,
        value: String
    }],
    reviews: [reviewSchema],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate average rating when reviews are added/updated
productSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.numReviews = 0;
    } else {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.averageRating = totalRating / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
};

// Static method to get products by category
productSchema.statics.getByCategory = function (categoryId) {
    return this.find({ category: categoryId })
        .populate('category', 'name')
        .select('-reviews');
};

// Static method to get featured products
productSchema.statics.getFeatured = function () {
    return this.find({ isFeatured: true })
        .populate('category', 'name')
        .select('-reviews');
};

// Pre-save middleware to calculate average rating
productSchema.pre('save', function (next) {
    this.calculateAverageRating();
    next();
});

module.exports = mongoose.model('Product', productSchema);