"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productsAPI, categoriesAPI } from "@/components/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

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
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAll();
      // The API now returns {products: [...], pagination: {...}}
      let productsArray = [];
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (data && data.data && Array.isArray(data.data.products)) {
        // Fallback for old response structure
        productsArray = data.data.products;
      }
      setProducts(productsArray);
    } catch (error) {
      toast.error("Failed to load products");
      setProducts([]); // Ensure products is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
    setEditImagePreview(product.images?.[0]?.url || '');
    setEditSelectedImage(null);
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
      
      // Add new image file directly to FormData if selected
      if (editSelectedImage) {
        formData.append('images', editSelectedImage);
      }
      
      await productsAPI.update(editing._id, formData);
      toast.success('Product updated successfully');
      setEditing(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
      setUploadingImage(false);
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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const removeEditImage = () => {
    setEditSelectedImage(null);
    setEditImagePreview('');
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
      
      // Add image files directly to FormData
      if (selectedImage) {
        formData.append('images', selectedImage);
        console.log('Image added to form data:', selectedImage.name, selectedImage.size, selectedImage.type);
      } else {
        console.log('No image selected');
      }
      
      // Debug: Log form data contents
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      await productsAPI.create(formData);
      toast.success('Product added successfully');
      setAdding(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto bg-secondary rounded-lg shadow-lg p-8 border border-primary">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-main">Product Management</h1>
          <button
            className="bg-primary text-background px-4 py-2 rounded hover:bg-primary-light font-semibold transition-colors"
            onClick={openAdd}
          >
            Add Product
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-text-main">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-primary">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Image</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-primary">
                  <td className="px-4 py-2">
                    {product.images?.[0]?.url ? (
                      <img
                        src={getOptimizedImageUrl(product.images[0].url, { width: 50, height: 50 })}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded border border-primary"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-background rounded border border-primary flex items-center justify-center text-text-muted text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-text-main">{product.name}</td>
                  <td className="px-4 py-2 text-text-main">{categories.find(cat => cat._id === product.category)?.name || 'N/A'}</td>
                  <td className="px-4 py-2 text-text-main">${product.price}</td>
                  <td className="px-4 py-2 text-text-main">{product.stock}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-accent-gold text-background px-3 py-1 rounded hover:bg-accent-bronze text-sm transition-colors"
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-error text-secondary px-3 py-1 rounded hover:bg-error/80 text-sm disabled:opacity-50 transition-colors"
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
          <div className="bg-secondary rounded-lg shadow-lg p-8 w-full max-w-md relative border border-primary">
            <button
              className="absolute top-2 right-2 text-text-muted hover:text-text-main text-2xl"
              onClick={() => setEditing(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-text-main">Edit Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Product Name"
              />
              <select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main"
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
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Price"
              />
              <input
                type="number"
                name="stock"
                value={editForm.stock}
                onChange={handleEditChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Stock"
              />
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Product Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main"
                />
                {(editImagePreview || editing.images?.[0]?.url) && (
                  <div className="mt-2 relative">
                    <img
                      src={editImagePreview || editing.images?.[0]?.url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border border-primary"
                    />
                    <button
                      type="button"
                      onClick={removeEditImage}
                      className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-error/80 transition-colors"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              className="mt-6 w-full bg-primary text-background font-semibold rounded-lg px-4 py-2 hover:bg-primary-light transition-colors disabled:opacity-50"
              onClick={handleEditSave}
              disabled={editLoading || uploadingImage}
            >
              {editLoading || uploadingImage ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
      {/* Add Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg shadow-lg p-8 w-full max-w-md relative border border-primary">
            <button
              className="absolute top-2 right-2 text-text-muted hover:text-text-main text-2xl"
              onClick={() => setAdding(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-text-main">Add Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={addForm.name}
                onChange={handleAddChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Product Name*"
              />
              <textarea
                name="description"
                value={addForm.description}
                onChange={handleAddChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Description*"
                rows={3}
              />
              <select
                name="category"
                value={addForm.category}
                onChange={handleAddChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main"
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
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="SKU*"
              />
              <input
                type="number"
                name="price"
                value={addForm.price}
                onChange={handleAddChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Price*"
              />
              <input
                type="number"
                name="stock"
                value={addForm.stock}
                onChange={handleAddChange}
                className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main placeholder-text-muted"
                placeholder="Stock*"
              />
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-primary rounded px-3 py-2 bg-background text-text-main"
                />
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border border-primary"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-error/80 transition-colors"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              className="mt-6 w-full bg-primary text-background font-semibold rounded-lg px-4 py-2 hover:bg-primary-light transition-colors disabled:opacity-50"
              onClick={handleAddSave}
              disabled={addLoading || uploadingImage}
            >
              {addLoading || uploadingImage ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 