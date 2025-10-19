# Product Parameters - Quick Start Guide

## How to Use the Parameter System

### Step 1: Create Parameters (Admin Panel)

1. Log in to Admin Panel (http://localhost:3000/admin)
2. Click on **"Parameters"** in the sidebar
3. Click **"Add New Parameter"** button
4. Fill in the parameter details:

#### Example 1: Size Parameter
- **Name**: Size
- **Type**: Select
- **Options**: Small, Medium, Large, Extra Large (add each one)
- **Required**: ✓ (checked)
- Click **Save**

#### Example 2: Color Parameter
- **Name**: Color
- **Type**: Select
- **Options**: Red, Blue, Green, Yellow, Black, White
- **Required**: ✓ (checked)
- Click **Save**

#### Example 3: Custom Dimensions
- **Name**: Custom Dimensions
- **Type**: Custom Range
- **Options**: 3x5, 4x6, 5x8, 6x9, Custom
- **Allow Custom**: ✓ (checked)
- **Unit**: feet
- **Required**: ✗ (optional)
- Click **Save**

#### Example 4: Special Instructions
- **Name**: Special Instructions
- **Type**: Text
- **Required**: ✗ (optional)
- Click **Save**

### Step 2: Assign Parameters to Products

1. In Admin Panel, go to **"Products"**
2. Click **"Edit"** on any product
3. Scroll down to **"Product Parameters"** section
4. Check the boxes for parameters you want customers to select
   - Example: For a T-shirt, select "Size" and "Color"
   - Example: For a carpet, select "Custom Dimensions"
5. Click **"Save Changes"**

### Step 3: Test on Product Details Page

1. Go to the product you just edited
2. You should now see **"Customize Your Product"** section
3. The parameters you assigned will appear with appropriate input controls:
   - **Select** parameters → Dropdown menu
   - **Custom Range** parameters → Buttons for options + custom input
   - **Text** parameters → Text input field
   - **Number** parameters → Number input
   - **Dimensions** parameters → Length × Width × Height inputs

### Step 4: Add to Cart with Parameters

1. Select values for all **required parameters** (marked with *)
2. Click **"Add to Cart"**
3. If you skip required parameters, you'll get an error message
4. Go to **Cart** page to see your selections displayed

### Step 5: Complete Order

1. Proceed to **Checkout**
2. Fill in shipping details
3. Submit order
4. View your order in **"My Orders"** to see the parameter values saved

### Step 6: Admin Order Management

1. In Admin Panel, go to **"Orders"**
2. Click on any order
3. You'll see the parameters selected by the customer under each order item
4. Use this information to fulfill the custom order

## Parameter Types Explained

### 1. Select
- Best for: Fixed options (Size, Color, Material)
- Customer sees: Dropdown menu
- Example: Size → Small, Medium, Large

### 2. Text
- Best for: Free-form input (Custom message, Name engraving)
- Customer sees: Text input field
- Example: "Add your custom message here"

### 3. Number
- Best for: Numeric values with limits (Quantity, Weight)
- Customer sees: Number input with min/max
- Example: Quantity (min: 1, max: 100)

### 4. Custom Range
- Best for: Predefined options + custom value (Dimensions, Specifications)
- Customer sees: Buttons for options + optional text input
- Example: Carpet Size → 3x5, 4x6, Custom (with input field)

### 5. Dimensions
- Best for: Length × Width × Height
- Customer sees: Three number inputs
- Example: Custom furniture dimensions (in cm or inches)

## Tips

✅ **Do:**
- Create reusable parameters (Size, Color, etc.)
- Mark truly required parameters as "Required"
- Use clear, descriptive parameter names
- Add units where applicable (cm, inches, lbs, etc.)

❌ **Don't:**
- Create duplicate parameters
- Mark everything as required
- Use overly technical names customers won't understand

## Troubleshooting

**Q: I don't see parameters on product page?**
- Make sure you assigned parameters to the product in Admin Panel
- Check that the product was saved after adding parameters

**Q: Parameters not saving in admin panel?**
- Make sure backend server is running (port 5001)
- Check browser console for errors
- Verify all required fields are filled

**Q: Can't add to cart?**
- Make sure all required parameters (marked with *) are selected
- Check browser console for validation errors

**Q: Parameters not showing in cart/orders?**
- This means the product didn't have parameters when added to cart
- Remove from cart and add again after assigning parameters

## Example Workflow

### T-Shirt Store Example:
1. Create "Size" parameter (S, M, L, XL)
2. Create "Color" parameter (Red, Blue, Black, White)
3. Edit each T-shirt product
4. Assign "Size" and "Color" to all T-shirts
5. Customers can now customize their order

### Custom Furniture Example:
1. Create "Material" parameter (Oak, Maple, Walnut)
2. Create "Dimensions" parameter (type: dimensions, unit: cm)
3. Create "Finish" parameter (Matte, Glossy, Natural)
4. Edit furniture products
5. Assign relevant parameters
6. Customers can fully customize their furniture

---

**Need Help?** Check the full implementation document: `PARAMETER_SYSTEM_IMPLEMENTATION.md`

