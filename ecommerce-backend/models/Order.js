const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: false,
        default: ''
    },
    image: {
        type: String,
        required: false,
        default: ''
    },
    price: {
        type: Number,
        required: false,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    selectedParameters: [{
        parameterId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Parameter'
        },
        parameterName: String,
        parameterType: String,
        value: mongoose.Schema.Types.Mixed // Can be string, number, object (for dimensions), etc.
    }]
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: false
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
});

const paymentResultSchema = new mongoose.Schema({
    id: String,
    status: String,
    update_time: String,
    email_address: String
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        required: false,
        default: 'Negotiable'
    },
    paymentResult: paymentResultSchema,
    itemsPrice: {
        type: Number,
        required: false,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: false,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: false,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: false,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: false,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    orderStatus: {
        type: String,
        required: true,
        enum: [
            'Pending',
            'Processing',
            'Shipped',
            'Delivered',
            'Cancelled',
            'Refunded'
        ],
        default: 'Pending'
    },
    trackingNumber: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    estimatedDelivery: {
        type: Date
    },
    negotiationNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });

// Virtual for order number (using _id)
orderSchema.virtual('orderNumber').get(function () {
    return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware to calculate total price
orderSchema.pre('save', function (next) {
    // Calculate items price
    this.itemsPrice = this.orderItems.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    // Calculate tax (assuming 10% tax rate)
    this.taxPrice = Number((this.itemsPrice * 0.1).toFixed(2));

    // Calculate shipping (free shipping for orders over $100)
    this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;

    // Calculate total price
    this.totalPrice = Number((this.itemsPrice + this.taxPrice + this.shippingPrice).toFixed(2));

    next();
});

// Static method to get orders by user
orderSchema.statics.getByUser = function (userId) {
    return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function (status) {
    return this.find({ orderStatus: status }).sort({ createdAt: -1 });
};

// Instance method to mark as paid
orderSchema.methods.markAsPaid = function (paymentResult) {
    this.isPaid = true;
    this.paidAt = Date.now();
    this.paymentResult = paymentResult;
    this.orderStatus = 'Processing';
};

// Instance method to mark as delivered
orderSchema.methods.markAsDelivered = function () {
    this.isDelivered = true;
    this.deliveredAt = Date.now();
    this.orderStatus = 'Delivered';
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function (reason) {
    this.orderStatus = 'Cancelled';
    this.notes = reason || 'Order cancelled by user';
};

// Instance method to update tracking
orderSchema.methods.updateTracking = function (trackingNumber, estimatedDelivery) {
    this.trackingNumber = trackingNumber;
    this.estimatedDelivery = estimatedDelivery;
    this.orderStatus = 'Shipped';
};

module.exports = mongoose.model('Order', orderSchema);