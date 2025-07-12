"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productsAPI } from "@/services/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  [key: string]: any;
}

interface Category {
  _id: string;
  name: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '', stock: '' });
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAll();
      setProducts(data.products || data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);
    try {
      await productsAPI.delete(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('category', editForm.category);
      formData.append('price', editForm.price);
      formData.append('stock', editForm.stock);
      
      // Add image if selected
      if (editSelectedImage) {
        formData.append('images', editSelectedImage);
      }
      
      await productsAPI.update(editing._id, formData);
      toast.success('Product updated successfully');
      setEditing(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  const openAdd = () => {
    setAddForm({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
    setSelectedImage(null);
    setImagePreview('');
    setAdding(true);
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
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

  const handleAddSave = async () => {
    if (!addForm.name || !addForm.description || !addForm.category || !addForm.price || !addForm.stock || !addForm.sku) {
      toast.error('Please fill all required fields.');
      return;
    }
    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('description', addForm.description);
      formData.append('category', addForm.category);
      formData.append('price', addForm.price);
      formData.append('stock', addForm.stock);
      formData.append('sku', addForm.sku);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('images', selectedImage);
      }
      
      await productsAPI.create(formData);
      toast.success('Product added successfully');
      setAdding(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Product Management</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
            onClick={openAdd}
          >
            Add Product
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{categories.find(cat => cat._id === product.category)?.name || 'N/A'}</td>
                  <td className="px-4 py-2">${product.price}</td>
                  <td className="px-4 py-2">{product.stock}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm disabled:opacity-50"
                      disabled={deleting === product._id}
                      onClick={() => handleDelete(product._id)}
                    >
                      {deleting === product._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setEditing(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Product Name"
              />
              <select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                name="price"
                value={editForm.price}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Price"
              />
              <input
                type="number"
                name="stock"
                value={editForm.stock}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Stock"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full border rounded px-3 py-2"
                />
                {editImagePreview && (
                  <div className="mt-2">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              className="mt-6 w-full bg-primary text-gold font-semibold rounded-lg px-4 py-2 hover:bg-gold hover:text-primary transition-colors"
              onClick={handleEditSave}
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
      {/* Add Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setAdding(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={addForm.name}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Product Name*"
              />
              <textarea
                name="description"
                value={addForm.description}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Description*"
                rows={3}
              />
              <select
                name="category"
                value={addForm.category}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Category*</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                name="sku"
                value={addForm.sku}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                placeholder="SKU*"
              />
              <input
                type="number"
                name="price"
                value={addForm.price}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Price*"
              />
              <input
                type="number"
                name="stock"
                value={addForm.stock}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Stock*"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border rounded px-3 py-2"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              className="mt-6 w-full bg-primary text-gold font-semibold rounded-lg px-4 py-2 hover:bg-gold hover:text-primary transition-colors"
              onClick={handleAddSave}
              disabled={addLoading}
            >
              {addLoading ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 