const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testProductCreation() {
    try {
        console.log('Testing product creation with image...');

        // Create form data
        const formData = new FormData();
        formData.append('name', 'Test Product with Image');
        formData.append('description', 'This is a test product with an image');
        formData.append('price', '99.99');
        formData.append('category', '68738b71830fe0365891a588'); // carpets category
        formData.append('stock', '10');
        formData.append('sku', 'TEST-IMG-001');

        // Add an image file
        const imagePath = path.join(__dirname, 'uploads/products/1752435512130_111122.jpg');
        if (fs.existsSync(imagePath)) {
            formData.append('images', fs.createReadStream(imagePath));
            console.log('Image file added to form data');
        } else {
            console.log('Image file not found');
            return;
        }

        // Make the request
        const response = await axios.post('http://localhost:5001/api/products', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // You'll need to get a valid token
            }
        });

        console.log('Response:', response.data);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testProductCreation(); 