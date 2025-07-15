// seed.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.warn('Warning: MONGODB_URI is not set in environment variables.');
}

// --- Define Schemas (minimal for seeding) ---
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    brand: String,
    sku: String,
    images: [{ url: String, alt: String }],
    stock: Number,
    rating: Number,
    numReviews: Number,
    specifications: [{ name: String, value: String }],
    tags: [String],
    isFeatured: Boolean,
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderItems: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            price: Number,
        },
    ],
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        postalCode: String,
        country: String,
        phone: String,
    },
    paymentMethod: String,
    itemsPrice: Number,
    taxPrice: Number,
    shippingPrice: Number,
    totalPrice: Number,
    isPaid: Boolean,
    isDelivered: Boolean,
    orderStatus: String,
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// --- Sample Data ---
const users = [
    {
        name: 'Alice Doe',
        email: 'alice@example.com',
        password: 'hashedpassword1',
        role: 'user',
        isEmailVerified: true,
    },
    {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'hashedpassword2',
        role: 'admin',
        isEmailVerified: true,
    },
];

const products = [
    {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation.',
        price: 99.99,
        category: 'Electronics',
        brand: 'SoundMagic',
        sku: 'SM-H100',
        images: [
            { url: '/uploads/products/headphones.jpg', alt: 'Wireless Headphones' },
        ],
        stock: 50,
        rating: 4.5,
        numReviews: 12,
        specifications: [
            { name: 'Battery Life', value: '30 hours' },
            { name: 'Bluetooth', value: '5.0' },
        ],
        tags: ['audio', 'wireless', 'headphones'],
        isFeatured: true,
    },
    {
        name: 'Smart Watch',
        description: 'Track your fitness and notifications with this smart watch.',
        price: 149.99,
        category: 'Electronics',
        brand: 'TimeTech',
        sku: 'TT-SW200',
        images: [
            { url: '/uploads/products/smartwatch.jpg', alt: 'Smart Watch' },
        ],
        stock: 30,
        rating: 4.2,
        numReviews: 8,
        specifications: [
            { name: 'Water Resistant', value: 'Yes' },
            { name: 'Heart Rate Monitor', value: 'Yes' },
        ],
        tags: ['wearable', 'fitness', 'smartwatch'],
        isFeatured: true,
    },
    {
        name: 'Eco-Friendly Water Bottle',
        description: 'Reusable, BPA-free water bottle for everyday use.',
        price: 19.99,
        category: 'Home & Garden',
        brand: 'GreenLife',
        sku: 'GL-WB01',
        images: [
            { url: '/uploads/products/waterbottle.jpg', alt: 'Eco-Friendly Water Bottle' },
        ],
        stock: 100,
        rating: 4.8,
        numReviews: 25,
        specifications: [
            { name: 'Capacity', value: '1L' },
            { name: 'Material', value: 'BPA-free plastic' },
        ],
        tags: ['eco', 'bottle', 'water'],
        isFeatured: false,
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Insert users
        const createdUsers = await User.insertMany(users);
        console.log('Users seeded:', createdUsers.map(u => u.email));

        // Insert products
        const createdProducts = await Product.insertMany(products);
        console.log('Products seeded:', createdProducts.map(p => p.name));

        // Insert a sample order
        const order = new Order({
            user: createdUsers[0]._id,
            orderItems: [
                { product: createdProducts[0]._id, quantity: 1, price: createdProducts[0].price },
                { product: createdProducts[1]._id, quantity: 2, price: createdProducts[1].price },
            ],
            shippingAddress: {
                fullName: createdUsers[0].name,
                address: '123 Main St',
                city: 'New York',
                postalCode: '10001',
                country: 'USA',
                phone: '555-1234',
            },
            paymentMethod: 'Credit Card',
            itemsPrice: createdProducts[0].price + 2 * createdProducts[1].price,
            taxPrice: 10,
            shippingPrice: 5,
            totalPrice: createdProducts[0].price + 2 * createdProducts[1].price + 10 + 5,
            isPaid: true,
            isDelivered: false,
            orderStatus: 'Processing',
        });
        await order.save();
        console.log('Sample order seeded');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed(); 