const mongoose = require('mongoose');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

async function fixOrders() {
    try {
        console.log('Starting order fix script...');
        
        // Wait for connection
        await mongoose.connection.asPromise();
        console.log('Connected to MongoDB');
        
        // Find all orders with missing name or image in orderItems
        const orders = await Order.find({
            $or: [
                { 'orderItems.name': { $exists: false } },
                { 'orderItems.name': null },
                { 'orderItems.name': '' },
                { 'orderItems.image': { $exists: false } },
                { 'orderItems.image': null },
                { 'orderItems.image': '' }
            ]
        });

        console.log(`Found ${orders.length} orders to fix`);

        for (const order of orders) {
            let updated = false;
            
            for (let item of order.orderItems) {
                if (!item.name || item.name === '') {
                    item.name = 'Product';
                    updated = true;
                }
                if (!item.image || item.image === '') {
                    item.image = '';
                    updated = true;
                }
            }
            
            if (updated) {
                await order.save();
                console.log(`Fixed order ${order._id}`);
            }
        }
        
        console.log('Order fix script completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing orders:', error);
        process.exit(1);
    }
}

fixOrders(); 