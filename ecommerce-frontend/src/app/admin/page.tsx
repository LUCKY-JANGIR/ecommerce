'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Package, ShoppingBag, BarChart3, Tag, Settings, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI } from "@/components/services/api";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { FiMenu, FiX } from 'react-icons/fi';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images?: Array<{ url: string; alt?: string }>;
  [key: string]: any;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [navOpen, setNavOpen] = useState(false);

  // Product Management States
  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productDeleting, setProductDeleting] = useState<string | null>(null);
  const [productEditing, setProductEditing] = useState<Product | null>(null);
  const [productEditLoading, setProductEditLoading] = useState(false);
  const [productEditForm, setProductEditForm] = useState({ name: '', category: '', price: '', stock: '' });
  const [productAdding, setProductAdding] = useState(false);
  const [productAddForm, setProductAddForm] = useState({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
  const [productAddLoading, setProductAddLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  // Category Management States
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryAdding, setCategoryAdding] = useState(false);
  const [categoryAddForm, setCategoryAddForm] = useState({ name: '', description: '', image: '' });
  const [categoryAddLoading, setCategoryAddLoading] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [categoryEditForm, setCategoryEditForm] = useState({ name: '', description: '', image: '' });
  const [categoryEditLoading, setCategoryEditLoading] = useState(false);
  const [categoryDeleting, setCategoryDeleting] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);

  useEffect(() => {
    // Check role from localStorage
    try {
      const persisted = localStorage.getItem('ecommerce-store');
      if (persisted) {
        const state = JSON.parse(persisted).state;
        const user = state?.auth?.user;
        if (user && user.role === 'admin') {
          setIsAdmin(true);
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    router.push('/');
    toast.error('Access denied. Admin privileges required.');
  }, [router]);

  // Fetch data when section changes
  useEffect(() => {
    if (activeSection === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeSection === 'categories') {
      fetchCategories();
    }
  }, [activeSection]);

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const data = await productsAPI.getAll();
      let productsArray = [];
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (data && data.data && Array.isArray(data.data.products)) {
        productsArray = data.data.products;
      }
      setProducts(productsArray);
    } catch (error) {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Product Management Functions
  const handleProductDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setProductDeleting(id);
    try {
      await productsAPI.delete(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setProductDeleting(null);
    }
  };

  const openProductEdit = (product: Product) => {
    setProductEditing(product);
    let categoryId = product.category;
    if (typeof product.category === 'object' && product.category !== null && '_id' in (product.category as any)) {
      categoryId = (product.category as any)._id;
    }
    setProductEditForm({
      name: product.name,
      category: categoryId,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    setEditImagePreview(product.images?.[0]?.url || '');
    setEditSelectedImage(null);
  };

  const handleProductEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProductEditForm({ ...productEditForm, [e.target.name]: e.target.value });
  };

  const handleProductEditSave = async () => {
    if (!productEditing) return;
    setProductEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', productEditForm.name);
      formData.append('category', productEditForm.category);
      formData.append('price', productEditForm.price);
      formData.append('stock', productEditForm.stock);
      
      if (editSelectedImage) {
        formData.append('images', editSelectedImage);
      }
      
      await productsAPI.update(productEditing._id, formData);
      toast.success('Product updated successfully');
      setProductEditing(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update product');
    } finally {
      setProductEditLoading(false);
    }
  };

  const openProductAdd = () => {
    setProductAddForm({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
    setSelectedImage(null);
    setImagePreview('');
    setProductAdding(true);
  };

  const handleProductAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductAddForm({ ...productAddForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductAddSave = async () => {
    if (!productAddForm.name || !productAddForm.description || !productAddForm.category || !productAddForm.price || !productAddForm.stock || !productAddForm.sku) {
      toast.error('Please fill all required fields.');
      return;
    }
    setProductAddLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', productAddForm.name);
      formData.append('description', productAddForm.description);
      formData.append('category', productAddForm.category);
      formData.append('price', productAddForm.price);
      formData.append('stock', productAddForm.stock);
      formData.append('sku', productAddForm.sku);
      
      if (selectedImage) {
        formData.append('images', selectedImage);
      }
      
      await productsAPI.create(formData);
      toast.success('Product added successfully');
      setProductAdding(false);
      setProductAddForm({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
      setSelectedImage(null);
      setImagePreview('');
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add product');
    } finally {
      setProductAddLoading(false);
    }
  };

  // Category Management Functions
  const handleCategoryAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategoryAddForm({ ...categoryAddForm, [e.target.name]: e.target.value });
  };

  const handleCategoryAddSave = async () => {
    if (!categoryAddForm.name) {
      toast.error('Name is required');
      return;
    }
    
    setCategoryAddLoading(true);
    try {
      await categoriesAPI.create({
        name: categoryAddForm.name,
        description: categoryAddForm.description
      });
      
      toast.success('Category added successfully');
      setCategoryAdding(false);
      setCategoryAddForm({ name: '', description: '', image: '' });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add category');
    } finally {
      setCategoryAddLoading(false);
    }
  };

  const openCategoryEdit = (cat: Category) => {
    setCategoryEditing(cat);
    setCategoryEditForm({ name: cat.name, description: cat.description, image: cat.image });
  };

  const handleCategoryEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategoryEditForm({ ...categoryEditForm, [e.target.name]: e.target.value });
  };

  const handleCategoryEditSave = async () => {
    if (!categoryEditing) return;
    setCategoryEditLoading(true);
    try {
      await categoriesAPI.update(categoryEditing._id, {
        name: categoryEditForm.name,
        description: categoryEditForm.description
      });
      
      toast.success('Category updated successfully');
      setCategoryEditing(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setCategoryEditLoading(false);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setCategoryDeleting(id);
    try {
      await categoriesAPI.delete(id);
      
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setCategoryDeleting(null);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const navLinks = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { key: 'categories', label: 'Categories', icon: <Tag className="w-5 h-5" /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">$0</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-gray-600">No recent activity to display.</p>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Product Management</h3>
              <button
                onClick={openProductAdd}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {/* Add Product Modal */}
            {productAdding && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">Add New Product</h3>
                      <button 
                        onClick={() => setProductAdding(false)} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Product Image Section */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Product Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                        {imagePreview && (
                          <div className="relative">
                            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                            <button
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview('');
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter product name"
                          value={productAddForm.name}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="sku"
                          placeholder="Enter SKU"
                          value={productAddForm.sku}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter product description"
                        value={productAddForm.description}
                        onChange={handleProductAddChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={productAddForm.category}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={productAddForm.price}
                            onChange={handleProductAddChange}
                            className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="stock"
                          placeholder="0"
                          value={productAddForm.stock}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleProductAddSave}
                        disabled={productAddLoading || !productAddForm.name || !productAddForm.description || !productAddForm.category || !productAddForm.price || !productAddForm.stock || !productAddForm.sku}
                        className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {productAddLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Adding Product...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Product
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setProductAdding(false)}
                        className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Product Modal */}
            {productEditing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">Edit Product</h3>
                      <button 
                        onClick={() => setProductEditing(null)} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Product Image Section */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Product Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                        {editImagePreview && (
                          <div className="relative">
                            <img src={editImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                            <button
                              onClick={() => {
                                setEditSelectedImage(null);
                                setEditImagePreview('');
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter product name"
                        value={productEditForm.name}
                        onChange={handleProductEditChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={productEditForm.category}
                          onChange={handleProductEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={productEditForm.price}
                            onChange={handleProductEditChange}
                            className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="stock"
                          placeholder="0"
                          value={productEditForm.stock}
                          onChange={handleProductEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleProductEditSave}
                        disabled={productEditLoading || !productEditForm.name || !productEditForm.category || !productEditForm.price || !productEditForm.stock}
                        className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {productEditLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setProductEditing(null)}
                        className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products List - Desktop Table */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No products found. Add your first product!
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder.png'}
                                    alt={product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {categories.find(cat => cat._id === product.category)?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openProductEdit(product)}
                                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded p-1.5"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleProductDelete(product._id)}
                                  disabled={productDeleting === product._id}
                                  className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 disabled:opacity-50"
                                >
                                  {productDeleting === product._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Products List - Mobile Cards */}
            <div className="md:hidden space-y-4">
              {products.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No products found. Add your first product!</div>
              ) : (
                products.map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <img src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder.png'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{categories.find(cat => cat._id === product.category)?.name || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <div>
                        <span className="font-medium">Price:</span> ${product.price}
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span> {product.stock}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openProductEdit(product)} className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded p-1.5 flex-1">Edit</button>
                      <button onClick={() => handleProductDelete(product._id)} disabled={productDeleting === product._id} className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 flex-1 disabled:opacity-50">{productDeleting === product._id ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Category Management</h3>
              <button
                onClick={() => setCategoryAdding(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>

            {/* Add Category Modal */}
            {categoryAdding && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">Add New Category</h3>
                      <button 
                        onClick={() => setCategoryAdding(false)} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter category name"
                        value={categoryAddForm.name}
                        onChange={handleCategoryAddChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter category description (optional)"
                        value={categoryAddForm.description}
                        onChange={handleCategoryAddChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleCategoryAddSave}
                        disabled={categoryAddLoading || !categoryAddForm.name}
                        className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {categoryAddLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Adding Category...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Category
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setCategoryAdding(false)}
                        className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Category Modal */}
            {categoryEditing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">Edit Category</h3>
                      <button 
                        onClick={() => setCategoryEditing(null)} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter category name"
                        value={categoryEditForm.name}
                        onChange={handleCategoryEditChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter category description (optional)"
                        value={categoryEditForm.description}
                        onChange={handleCategoryEditChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleCategoryEditSave}
                        disabled={categoryEditLoading || !categoryEditForm.name}
                        className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {categoryEditLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setCategoryEditing(null)}
                        className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List - Desktop Table */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                            No categories found. Add your first category!
                          </td>
                        </tr>
                      ) : (
                        categories.map((category) => (
                          <tr key={category._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">{category.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openCategoryEdit(category)}
                                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded p-1.5"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(category._id)}
                                  disabled={categoryDeleting === category._id}
                                  className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 disabled:opacity-50"
                                >
                                  {categoryDeleting === category._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Categories List - Mobile Cards */}
            <div className="md:hidden space-y-4">
              {categories.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No categories found. Add your first category!</div>
              ) : (
                categories.map(category => (
                  <div key={category._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
                    <div className="font-semibold text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openCategoryEdit(category)} className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded p-1.5 flex-1">Edit</button>
                      <button onClick={() => handleCategoryDelete(category._id)} disabled={categoryDeleting === category._id} className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 flex-1 disabled:opacity-50">{categoryDeleting === category._id ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Management</h3>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                View Orders
              </button>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600">Order management functionality coming soon.</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Management</h3>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Manage Users
              </button>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600">User management functionality coming soon.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Save Settings
              </button>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600">Settings functionality coming soon.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back to home */}
          {/* 1. Remove the 'Back to Home' link. */}
          {/* 2. Remove the 'Management Sections' box (the box with the section title and grid of nav buttons). */}
          {/* 3. Change the 'Admin Panel' text to a smaller size, e.g., 'text-base' or 'text-lg'. */}
          <h1 className="text-base font-bold text-gray-800 mb-4 mt-2">Admin Panel</h1>

          {/* Desktop Navigation Grid */}
          <div className="hidden md:grid grid-cols-6 gap-4 mb-6">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg font-semibold transition-colors border-2 ${activeSection === link.key ? 'bg-white text-blue-600 border-primary hover:text-white hover:bg-primary' : 'bg-primary text-white border-primary/20 hover:bg-primary/90 hover:text-white'}`}
              >
                {link.icon}
                <span className="mt-2 text-xs font-medium">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Tab Bar */}
          <div className="md:hidden flex items-center gap-2 px-2 py-2 overflow-x-auto bg-background border-t border-primary mb-4">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded font-semibold text-sm transition-colors ${activeSection === link.key ? 'bg-white text-blue-600 border border-primary hover:text-white hover:bg-primary' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 