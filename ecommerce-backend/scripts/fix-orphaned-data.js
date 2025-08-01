const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

async function fixOrphanedData() {
    try {
        console.log('🔧 Fixing orphaned data...');

        // Wait for connection
        await mongoose.connection.asPromise();
        console.log('✅ Connected to MongoDB');

        // Find orphaned orders (orders without valid user)
        const orphanedOrders = await Order.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            {
                $match: {
                    userData: { $size: 0 }
                }
            }
        ]);

        console.log(`Found ${orphanedOrders.length} orphaned orders`);

        if (orphanedOrders.length > 0) {
            // Get a valid user to assign orphaned orders to
            const validUser = await User.findOne();

            if (validUser) {
                for (const order of orphanedOrders) {
                    await Order.findByIdAndUpdate(order._id, {
                        user: validUser._id
                    });
                    console.log(`✅ Fixed orphaned order ${order._id}`);
                }
            } else {
                console.log('❌ No valid users found to assign orphaned orders');
            }
        }

        // Find orphaned products (products without valid category)
        const orphanedProducts = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $match: {
                    categoryData: { $size: 0 }
                }
            }
        ]);

        console.log(`Found ${orphanedProducts.length} orphaned products`);

        if (orphanedProducts.length > 0) {
            // Get a valid category to assign orphaned products to
            const validCategory = await require('../models/Category').findOne();

            if (validCategory) {
                for (const product of orphanedProducts) {
                    await Product.findByIdAndUpdate(product._id, {
                        category: validCategory._id
                    });
                    console.log(`✅ Fixed orphaned product ${product._id}`);
                }
            } else {
                console.log('❌ No valid categories found to assign orphaned products');
            }
        }

        console.log('🎉 Orphaned data fix completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
}

fixOrphanedData(); 