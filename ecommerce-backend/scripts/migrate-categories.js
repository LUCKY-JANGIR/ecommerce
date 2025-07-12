const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

async function migrateCategories() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    const products = await Product.find();
    let updated = 0;
    for (const product of products) {
        if (typeof product.category === 'string' && product.category.trim() !== '') {
            let cat = await Category.findOne({ name: product.category });
            if (!cat) {
                cat = await Category.create({ name: product.category });
                console.log(`Created new category: ${cat.name}`);
            }
            product.category = cat._id;
            await product.save();
            updated++;
            console.log(`Updated product ${product.name} to category ${cat.name}`);
        }
    }
    console.log(`\nMigration complete. Updated ${updated} products.`);
    process.exit(0);
}

migrateCategories().catch(err => { console.error(err); process.exit(1); }); 