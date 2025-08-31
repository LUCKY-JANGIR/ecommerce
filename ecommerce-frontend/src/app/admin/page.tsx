'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, ShoppingBag, BarChart3, Tag, Settings, Plus, Edit, Trash2, X, Star } from 'lucide-react';
import { FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, uploadAPI } from "@/components/services/api";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import MultipleImageUpload from "@/app/components/ui/MultipleImageUpload";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string | { _id: string; name: string };
  price: number;
  stock: number;
  isFeatured?: boolean;
  images?: Array<{ url: string; alt?: string }>;

}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface ImageItem {
  id: string;
  url?: string;
  file?: File;
  alt?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Product Management States
  const [products, setProducts] = useState<Product[]>([]);
  const [productDeleting, setProductDeleting] = useState<string | null>(null);
  const [productEditing, setProductEditing] = useState<Product | null>(null);
  const [productEditLoading, setProductEditLoading] = useState(false);
  const [productEditForm, setProductEditForm] = useState({ name: '', description: '', category: '', price: '', stock: '' });
  const [productAdding, setProductAdding] = useState(false);
  const [productAddForm, setProductAddForm] = useState({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
  const [productAddLoading, setProductAddLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [editSelectedImages, setEditSelectedImages] = useState<ImageItem[]>([]);

  // Category Management States
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryAdding, setCategoryAdding] = useState(false);
  const [categoryAddForm, setCategoryAddForm] = useState({ name: '', description: '', image: '' });
  const [categoryAddLoading, setCategoryAddLoading] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [categoryEditForm, setCategoryEditForm] = useState({ name: '', description: '', image: '' });
  const [categoryEditLoading, setCategoryEditLoading] = useState(false);
  const [categoryDeleting, setCategoryDeleting] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);


  // Body scroll lock for modals
  useEffect(() => {
    const isAnyModalOpen = productAdding || productEditing || categoryAdding || categoryEditing;
    
    if (isAnyModalOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift from scrollbar
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [productAdding, productEditing, categoryAdding, categoryEditing]);

  // Order Management States
  const [orders, setOrders] = useState<Array<{
    _id: string;
    orderStatus: string;
    isPaid: boolean;
    createdAt: string;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    negotiationNotes?: string;
    user?: {
      name: string;
      email: string;
    };
    shippingAddress?: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod?: string;
  }>>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStats, setOrderStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
  } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{
    _id: string;
    orderStatus: string;
    isPaid: boolean;
    createdAt: string;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    negotiationNotes?: string;
    user?: {
      name: string;
      email: string;
    };
    shippingAddress?: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod?: string;
  } | null>(null);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState<string | null>(null);
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [paymentStatusUpdating, setPaymentStatusUpdating] = useState<string | null>(null);
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    isPaid: '',
    page: 1,
    limit: 10
  });

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
    } catch {
      // ignore
    }
    router.push('/');
    toast.error('Access denied. Admin privileges required.');
  }, [router]);

  // Fetch data when section changes
  // Order Management Functions
  const fetchOrders = useCallback(async () => {
    setOrderLoading(true);
    try {
      const { ordersAPI } = await import('@/components/services/api');
      const response = await ordersAPI.getAll(orderFilters);
      setOrders(response.orders || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setOrderLoading(false);
    }
  }, [orderFilters]);

  useEffect(() => {
    if (activeSection === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeSection === 'categories') {
      fetchCategories();
    } else if (activeSection === 'orders') {
      fetchOrders();
      fetchOrderStats();
    }
  }, [activeSection, orderFilters, fetchOrders]);

  const fetchOrderStats = async () => {
    try {
      const { ordersAPI } = await import('@/components/services/api');
      const stats = await ordersAPI.getStats();
      setOrderStats(stats);
    } catch {
      // Error handled silently
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    setOrderStatusUpdating(orderId);
    try {
      const { ordersAPI } = await import('@/components/services/api');
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh orders
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  const handleNegotiationNotesUpdate = async (orderId: string) => {
    setUpdatingNotes(true);
    try {
      const { ordersAPI } = await import('@/components/services/api');
      await ordersAPI.updateNegotiationNotes(orderId, negotiationNotes);
      toast.success('Negotiation notes updated successfully');
      setNegotiationNotes('');
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders
    } catch {
      toast.error('Failed to update negotiation notes');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, isPaid: boolean) => {
    setPaymentStatusUpdating(orderId);
    try {
      const { ordersAPI } = await import('@/components/services/api');
      await ordersAPI.updatePaymentStatus(orderId, isPaid);
      toast.success(`Payment status updated to ${isPaid ? 'Paid' : 'Unpaid'}`);
      fetchOrders(); // Refresh orders
    } catch {
      toast.error('Failed to update payment status');
    } finally {
      setPaymentStatusUpdating(null);
    }
  };

  const openOrderDetails = (order: {
    _id: string;
    orderStatus: string;
    isPaid: boolean;
    createdAt: string;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    negotiationNotes?: string;
    user?: {
      name: string;
      email: string;
    };
    shippingAddress?: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod?: string;
  }) => {
    setSelectedOrder(order);
    setNegotiationNotes(order.negotiationNotes || '');
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setNegotiationNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchProducts = async () => {
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

  // Product Management Functions
  const handleProductDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setProductDeleting(id);
    try {
      await productsAPI.delete(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setProductDeleting(null);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await productsAPI.toggleFeatured(id);
      toast.success("Featured status updated successfully");
      fetchProducts();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const openProductEdit = (product: Product) => {
    setProductEditing(product);
    let categoryId = product.category;
    if (typeof product.category === 'object' && product.category !== null && '_id' in (product.category as { _id: string; name: string })) {
      categoryId = (product.category as { _id: string; name: string })._id;
    }
    setProductEditForm({
      name: product.name,
      description: product.description || '',
      category: categoryId as string,
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

  const handleProductEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProductEditForm({ ...productEditForm, [e.target.name]: e.target.value });
  };

  const handleProductEditSave = async () => {
    if (!productEditing) return;
    setProductEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', productEditForm.name);
      formData.append('description', productEditForm.description);
      formData.append('category', productEditForm.category);
      formData.append('price', productEditForm.price);
      formData.append('stock', productEditForm.stock);
      
      // Handle images: send both existing URLs and new files
      editSelectedImages.forEach((imageItem) => {
        if (imageItem.file) {
          // New file
          formData.append('images', imageItem.file);
        } else if (imageItem.url) {
          // Existing image URL - send as string
          formData.append('existingImages', imageItem.url);
        }
      });
      
      // Send the order of images (use URLs for existing images, IDs for new ones)
      const imageOrder = editSelectedImages.map(img => img.url || img.id);
      formData.append('imageOrder', JSON.stringify(imageOrder));
      
      await productsAPI.update(productEditing._id, formData);
      toast.success('Product updated successfully');
      setProductEditing(null);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to update product';
      toast.error(errorMessage);
    } finally {
      setProductEditLoading(false);
    }
  };

  const openProductAdd = () => {
    setProductAddForm({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
    setSelectedImages([]);
    setProductAdding(true);
  };

  const handleProductAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductAddForm({ ...productAddForm, [e.target.name]: e.target.value });
  };

  const handleImagesChange = (images: ImageItem[]) => {
    setSelectedImages(images);
  };

  const handleEditImagesChange = (images: ImageItem[]) => {
    setEditSelectedImages(images);
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
      
      // Add multiple images
      selectedImages.forEach((imageItem) => {
        if (imageItem.file) {
          formData.append('images', imageItem.file);
        }
      });
      
      await productsAPI.create(formData);
      toast.success('Product added successfully');
      setProductAdding(false);
      setProductAddForm({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
      setSelectedImages([]);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to add product';
      toast.error(errorMessage);
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
      const formData = new FormData();
      formData.append('name', categoryAddForm.name);
      formData.append('description', categoryAddForm.description);
      if (categoryImageFile) {
        formData.append('image', categoryImageFile);
      }
      await categoriesAPI.create(formData);
      toast.success('Category added successfully');
      setCategoryAdding(false);
      setCategoryAddForm({ name: '', description: '', image: '' });
      setCategoryImageFile(null);
      fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to add category';
      toast.error(errorMessage);
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
      const formData = new FormData();
      formData.append('name', categoryEditForm.name);
      formData.append('description', categoryEditForm.description);
      if (categoryImageFile) {
        formData.append('image', categoryImageFile);
      }
      await categoriesAPI.update(categoryEditing._id, formData);
      toast.success('Category updated successfully');
      setCategoryEditing(null);
      setCategoryImageFile(null);
      fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to update category';
      toast.error(errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to delete category';
      toast.error(errorMessage);
    } finally {
      setCategoryDeleting(null);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const navLinks = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'products', label: 'Products', icon: <ShoppingBag className="w-5 h-5" /> },
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
            {/* Statistics Carousel */}
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                navigation={{
                  nextEl: '.stats-swiper-next',
                  prevEl: '.stats-swiper-prev',
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 16,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 16,
                  },
                }}
                className="stats-swiper"
              >
                <SwiperSlide>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{products.length}</div>
                        <div className="text-sm opacity-90">Total Products</div>
                      </div>
                      <ShoppingBag className="h-8 w-8 opacity-80" />
                    </div>
                  </motion.div>
                </SwiperSlide>
                
                <SwiperSlide>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <div className="text-sm opacity-90">Categories</div>
                      </div>
                      <Tag className="h-8 w-8 opacity-80" />
                    </div>
                  </motion.div>
                </SwiperSlide>
                
                <SwiperSlide>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{orders.length}</div>
                        <div className="text-sm opacity-90">Total Orders</div>
                      </div>
                      <FiPackage className="h-8 w-8 opacity-80" />
                    </div>
                  </motion.div>
                </SwiperSlide>
                
                <SwiperSlide>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">$0</div>
                        <div className="text-sm opacity-90">Total Revenue</div>
                      </div>
                      <BarChart3 className="h-8 w-8 opacity-80" />
                    </div>
                  </motion.div>
                </SwiperSlide>
              </Swiper>
              
              {/* Custom Navigation Buttons */}
              <div className="stats-swiper-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="stats-swiper-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {products.length > 0 ? (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Products loaded successfully</p>
                      <p className="text-xs text-gray-500">{products.length} products available</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No recent activity to display.</p>
                )}
              </div>
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {/* Add Product Modal */}
            {productAdding && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setProductAdding(false);
                  }
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8"
                  onClick={(e) => e.stopPropagation()}
                >
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
                  
                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Product Images Section */}
                    <div className="space-y-3">
                      <MultipleImageUpload
                        images={selectedImages}
                        onChange={handleImagesChange}
                        maxImages={5}
                        disabled={productAddLoading}
                      />
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
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setProductEditing(null);
                  }
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
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
                  
                  <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                    {/* Product Images Section */}
                    <div className="space-y-3">
                      <MultipleImageUpload
                        images={editSelectedImages}
                        onChange={handleEditImagesChange}
                        maxImages={5}
                        disabled={productEditLoading}
                      />
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

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter product description"
                        value={productEditForm.description}
                        onChange={handleProductEditChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
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
                              {typeof product.category === 'object' && product.category !== null 
                                ? (product.category as { _id: string; name: string }).name 
                                : categories.find(cat => cat._id === product.category)?.name || 'Unknown'}
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
                  <div key={product._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <Image src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder.png'} alt={product.name} className="w-16 h-16 object-cover rounded" width={64} height={64} />
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {typeof product.category === 'object' && product.category !== null 
                            ? (product.category as { _id: string; name: string }).name 
                            : categories.find(cat => cat._id === product.category)?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <div>
                        <span className="font-medium">Price:</span> ${product.price}
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span> {product.stock}
                      </div>
                      <div>
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
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                                      <button onClick={() => openProductEdit(product)} className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:text-white transition-colors rounded p-1.5 flex-1 shadow-sm">Edit</button>
                <button onClick={() => handleProductDelete(product._id)} disabled={productDeleting === product._id} className="bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:text-white transition-colors rounded p-1.5 flex-1 disabled:opacity-50 shadow-sm">{productDeleting === product._id ? 'Deleting...' : 'Delete'}</button>
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
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>

            {/* Add Category Modal */}
            {categoryAdding && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setCategoryAdding(false);
                  }
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col my-8"
                  onClick={(e) => e.stopPropagation()}
                >
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
                  
                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
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

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Category Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCategoryImageFile(file);
                                setCategoryImageUploading(true);
                                try {
                                  const uploadRes = await uploadAPI.uploadImage(file, 'categories');
                                  if (uploadRes && uploadRes.data && uploadRes.data.url) {
                                    setCategoryAddForm(f => ({ ...f, image: uploadRes.data.url }));
                                    toast.success('Image uploaded!');
                                  } else {
                                    toast.error('Image upload failed');
                                  }
                                } catch {
                                  toast.error('Image upload failed');
                                } finally {
                                  setCategoryImageUploading(false);
                                }
                              }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                        {categoryAddForm.image && (
                          <div className="relative">
                            <Image src={categoryAddForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" width={80} height={80} />
                            <button
                              onClick={() => {
                                setCategoryImageFile(null);
                                setCategoryAddForm(f => ({ ...f, image: '' }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
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
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setCategoryEditing(null);
                  }
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col my-8"
                  onClick={(e) => e.stopPropagation()}
                >
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
                  
                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
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

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Category Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCategoryImageFile(file);
                                setCategoryImageUploading(true);
                                try {
                                  const uploadRes = await uploadAPI.uploadImage(file, 'categories');
                                  if (uploadRes && uploadRes.data && uploadRes.data.url) {
                                    setCategoryEditForm(f => ({ ...f, image: uploadRes.data.url }));
                                    toast.success('Image uploaded!');
                                  } else {
                                    toast.error('Image upload failed');
                                  }
                                } catch {
                                  toast.error('Image upload failed');
                                } finally {
                                  setCategoryImageUploading(false);
                                }
                              }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                        {categoryEditForm.image && (
                          <div className="relative">
                            <Image src={categoryEditForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" width={80} height={80} />
                            <button
                              onClick={() => {
                                setCategoryImageFile(null);
                                setCategoryEditForm(f => ({ ...f, image: '' }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
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
                  <div key={category._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col gap-2">
                    <div className="font-semibold text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                    <div className="flex gap-2 mt-2">
                                      <button onClick={() => openCategoryEdit(category)} className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:text-white transition-colors rounded p-1.5 flex-1 shadow-sm">Edit</button>
                <button onClick={() => handleCategoryDelete(category._id)} disabled={categoryDeleting === category._id} className="bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:text-white transition-colors rounded p-1.5 flex-1 disabled:opacity-50 shadow-sm">{categoryDeleting === category._id ? 'Deleting...' : 'Delete'}</button>
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
            {/* Order Statistics */}
            {orderStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
                  <div className="text-sm opacity-90">Total Orders</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">{orderStats.pendingOrders}</div>
                  <div className="text-sm opacity-90">Pending</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">{orderStats.deliveredOrders}</div>
                  <div className="text-sm opacity-90">Delivered</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">${orderStats.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <div className="text-sm opacity-90">Total Revenue</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={orderFilters.status}
                    onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value, page: 1 })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                  <select
                    value={orderFilters.isPaid}
                    onChange={(e) => setOrderFilters({ ...orderFilters, isPaid: e.target.value, page: 1 })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Paid</option>
                    <option value="false">Unpaid</option>
                  </select>
                </div>
                <button
                  onClick={() => setOrderFilters({ status: '', isPaid: '', page: 1, limit: 10 })}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
              </div>
              
              {orderLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No orders found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order._id.slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{order.user?.name || 'N/A'}</div>
                              <div className="text-gray-500">{order.user?.email || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {order.orderItems?.length || 0} items
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              disabled={orderStatusUpdating === order._id}
                              className={`text-sm px-2 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {order.isPaid ? 'Paid' : 'Unpaid'}
                              </span>
                              <button
                                onClick={() => handlePaymentStatusUpdate(order._id, !order.isPaid)}
                                disabled={paymentStatusUpdating === order._id}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                              >
                                {paymentStatusUpdating === order._id ? 'Updating...' : 'Toggle'}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                className={`flex flex-col items-center justify-center p-4 rounded-lg font-semibold transition-colors border-2 shadow-md ${activeSection === link.key ? 'bg-white text-primary-700 border-primary-600 hover:bg-primary-600 hover:text-white shadow-lg' : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 hover:text-white shadow-lg'}`}
              >
                {link.icon}
                <span className="mt-2 text-xs font-medium">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Tab Bar */}
          <div className="md:hidden flex items-center gap-2 px-2 py-2 overflow-x-auto bg-gray-50 border-t border-gray-200 mb-4">
            {navLinks.map(link => (
                <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded font-semibold text-sm transition-colors shadow-sm ${activeSection === link.key ? 'bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 shadow-md' : 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-600 hover:text-white shadow-md'}`}
              >
                {link.icon}
                {link.label}
                </button>
              ))}
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            {renderSectionContent()}
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Details - #{selectedOrder._id.slice(-6)}
                  </h3>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedOrder.user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedOrder.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Shipping Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress?.address}</p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                      </p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress?.country}</p>
                      <p className="text-gray-600">Phone: {selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.orderItems?.map((item: {
                        name: string;
                        quantity: number;
                        price: number;
                        image?: string;
                      }, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" width={48} height={48} />
                            ) : (
                              <FiPackage className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-600">Price: Negotiable</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Order Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.orderStatus)}`}>
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${selectedOrder.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          <button
                            onClick={() => handlePaymentStatusUpdate(selectedOrder._id, !selectedOrder.isPaid)}
                            disabled={paymentStatusUpdating === selectedOrder._id}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            {paymentStatusUpdating === selectedOrder._id ? 'Updating...' : 'Toggle Payment'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium">{selectedOrder.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Negotiation Notes */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Negotiation Notes</h4>
                    <textarea
                      value={negotiationNotes}
                      onChange={(e) => setNegotiationNotes(e.target.value)}
                      placeholder="Add negotiation notes here..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={4}
                    />
                    <div className="mt-3 flex justify-end space-x-3">
                      <button
                        onClick={closeOrderDetails}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleNegotiationNotesUpdate(selectedOrder._id)}
                        disabled={updatingNotes}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {updatingNotes ? 'Updating...' : 'Update Notes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 