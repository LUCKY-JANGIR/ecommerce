"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { productsAPI, categoriesAPI } from "@/components/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Star } from "lucide-react";
import MultipleImageUpload from "@/app/components/ui/MultipleImageUpload";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  isFeatured?: boolean;
  images?: Array<{ url: string; alt?: string }>;

}

interface Category {
  _id: string;
  name: string;
}

interface ImageItem {
  id: string;
  url?: string;
  file?: File;
  alt?: string;
}

export default function AdminProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    description: '',
    category: '', 
    price: '', 
    stock: '' 
  });

  const [editSelectedImages, setEditSelectedImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleToggleFeatured = async (id: string) => {
    try {
      await productsAPI.toggleFeatured(id);
      toast.success("Featured status updated successfully");
      fetchProducts();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
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
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch {
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
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const handleEditImagesChange = (images: ImageItem[]) => {
    setEditSelectedImages(images);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    
    // Convert existing images to ImageItem format
    const existingImages: ImageItem[] = (product.images || []).map((img, index) => ({
      id: `existing-${index}`,
      url: img.url,
      alt: img.alt || product.name
    }));
    setEditSelectedImages(existingImages);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('category', editForm.category);
      formData.append('price', editForm.price);
      formData.append('stock', editForm.stock);
      
      // Add new images (files) to formData
      const newImages = editSelectedImages.filter(img => img.file);
      newImages.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
      
      await productsAPI.update(editing._id, formData);
      toast.success('Product updated successfully');
      setEditing(null);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
      setUploadingImage(false);
    }
  };

  // Rest of the functions remain the same...

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <Link href="/admin" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
            Back to Admin
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No products found. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <Image
                                className="h-10 w-10 rounded-full object-cover"
                                src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder.png'}
                                alt={product.name}
                                width={40}
                                height={40}
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
                          <button
                            onClick={() => handleToggleFeatured(product._id)}
                            className={`p-1 rounded transition-colors ${
                              product.isFeatured 
                                ? 'text-yellow-500 hover:text-yellow-600' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Star className={`h-5 w-5 ${product.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded p-1.5"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deleting === product._id}
                              className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 disabled:opacity-50"
                            >
                              {deleting === product._id ? 'Deleting...' : 'Delete'}
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
        )}

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
              <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Product</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Product Name"
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Description"
                  rows={3}
                />
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
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
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Price"
                />
                <input
                  type="number"
                  name="stock"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Stock"
                />
                <MultipleImageUpload
                  images={editSelectedImages}
                  onChange={handleEditImagesChange}
                  maxImages={5}
                  disabled={editLoading}
                />
              </div>
              <button
                className="mt-6 w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleEditSave}
                disabled={editLoading || uploadingImage}
              >
                {editLoading || uploadingImage ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}