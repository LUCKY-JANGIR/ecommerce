const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

async function productionChecklist() {
    try {
        console.log('🔍 Production Readiness Checklist');
        console.log('================================\n');
        
        // Wait for connection
        await mongoose.connection.asPromise();
        console.log('✅ Database Connection: OK');
        
        // 1. Environment Variables Check
        console.log('\n📋 Environment Variables:');
        const requiredEnvVars = [
            'MONGODB_URI',
            'JWT_SECRET',
            'EMAILJS_SERVICE_ID',
            'EMAILJS_PUBLIC_KEY'
        ];
        
        let envVarsOk = true;
        for (const envVar of requiredEnvVars) {
            if (process.env[envVar]) {
                console.log(`   ✅ ${envVar}: SET`);
            } else {
                console.log(`   ❌ ${envVar}: MISSING`);
                envVarsOk = false;
            }
        }
        
        // 2. Database Schema Validation
        console.log('\n🗄️ Database Schema Validation:');
        
        // Check Orders
        const orders = await Order.find().limit(1);
        if (orders.length > 0) {
            const order = orders[0];
            const orderValidation = {
                hasUser: !!order.user,
                hasOrderItems: order.orderItems && order.orderItems.length > 0,
                hasOrderStatus: !!order.orderStatus,
                hasPaymentMethod: !!order.paymentMethod,
                hasRequiredFields: !!(order.itemsPrice !== undefined && order.totalPrice !== undefined)
            };
            
            console.log('   📦 Orders Schema:');
            Object.entries(orderValidation).forEach(([key, value]) => {
                console.log(`      ${value ? '✅' : '❌'} ${key}: ${value}`);
            });
        } else {
            console.log('   📦 Orders Schema: No orders to validate');
        }
        
        // Check Products
        const products = await Product.find().limit(1);
        if (products.length > 0) {
            const product = products[0];
            const productValidation = {
                hasName: !!product.name,
                hasDescription: !!product.description,
                hasPrice: typeof product.price === 'number',
                hasCategory: !!product.category,
                hasStock: typeof product.stock === 'number'
            };
            
            console.log('   📱 Products Schema:');
            Object.entries(productValidation).forEach(([key, value]) => {
                console.log(`      ${value ? '✅' : '❌'} ${key}: ${value}`);
            });
        } else {
            console.log('   📱 Products Schema: No products to validate');
        }
        
        // 3. Data Integrity Check
        console.log('\n🔒 Data Integrity Check:');
        
        // Check for orphaned orders (orders without valid user)
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
        
        console.log(`   ${orphanedOrders.length === 0 ? '✅' : '❌'} Orphaned Orders: ${orphanedOrders.length}`);
        
        // Check for orphaned products (products without valid category)
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
        
        console.log(`   ${orphanedProducts.length === 0 ? '✅' : '❌'} Orphaned Products: ${orphanedProducts.length}`);
        
        // 4. Performance Check
        console.log('\n⚡ Performance Check:');
        
        // Check indexes
        const orderIndexes = await Order.collection.indexes();
        const productIndexes = await Product.collection.indexes();
        const userIndexes = await User.collection.indexes();
        
        console.log(`   📊 Order Indexes: ${orderIndexes.length}`);
        console.log(`   📊 Product Indexes: ${productIndexes.length}`);
        console.log(`   📊 User Indexes: ${userIndexes.length}`);
        
        // 5. Collection Statistics
        console.log('\n📈 Collection Statistics:');
        
        const orderCount = await Order.countDocuments();
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const categoryCount = await Category.countDocuments();
        
        console.log(`   📦 Orders: ${orderCount}`);
        console.log(`   📱 Products: ${productCount}`);
        console.log(`   👤 Users: ${userCount}`);
        console.log(`   📂 Categories: ${categoryCount}`);
        
        // 6. Recent Activity Check
        console.log('\n🕒 Recent Activity:');
        
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderStatus createdAt');
        
        console.log(`   📦 Recent Orders: ${recentOrders.length} in last 5`);
        recentOrders.forEach(order => {
            console.log(`      - ${order.orderStatus} (${order.createdAt.toLocaleDateString()})`);
        });
        
        // 7. Error Rate Check (if we had error logging)
        console.log('\n🚨 Error Monitoring:');
        console.log('   ℹ️ Error logging not implemented - consider adding error tracking');
        
        // 8. Security Check
        console.log('\n🔐 Security Check:');
        console.log(`   ${process.env.JWT_SECRET ? '✅' : '❌'} JWT Secret: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`);
        console.log('   ℹ️ Consider implementing rate limiting');
        console.log('   ℹ️ Consider implementing CORS properly');
        
        // 9. Final Assessment
        console.log('\n🎯 Production Readiness Assessment:');
        
        const issues = [];
        if (!envVarsOk) issues.push('Missing environment variables');
        if (orphanedOrders.length > 0) issues.push('Orphaned orders found');
        if (orphanedProducts.length > 0) issues.push('Orphaned products found');
        
        if (issues.length === 0) {
            console.log('   ✅ PRODUCTION READY!');
            console.log('   🚀 Application is ready for production deployment');
        } else {
            console.log('   ⚠️ ISSUES FOUND:');
            issues.forEach(issue => console.log(`      - ${issue}`));
            console.log('   🔧 Please fix issues before production deployment');
        }
        
        console.log('\n📋 Recommendations:');
        console.log('   1. Set up proper error logging (e.g., Sentry)');
        console.log('   2. Implement rate limiting');
        console.log('   3. Set up monitoring and alerting');
        console.log('   4. Configure proper CORS settings');
        console.log('   5. Set up automated backups');
        console.log('   6. Implement health check endpoints');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Production checklist failed:', error);
        process.exit(1);
    }
}

productionChecklist(); 