'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, ShoppingBag, BarChart3, Tag, Settings, Plus, Edit, Trash2, X, Star, User, MessageCircle, DollarSign } from 'lucide-react';
import UniversalModal from '@/components/UniversalModal';
import { FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, uploadAPI, parametersAPI } from "@/components/services/api";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import MultipleImageUpload from "@/app/components/ui/MultipleImageUpload";
import { AdminPageSkeleton } from "@/components/ui/Skeleton";

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
  parameters?: Array<{ _id: string; name: string; type: string }>;
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
  const [initialLoading, setInitialLoading] = useState(true);

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
    itemsPrice?: number;
    shippingPrice?: number;
    taxPrice?: number;
    totalPrice?: number;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
      selectedParameters?: Array<{
        parameterId: string;
        parameterName: string;
        parameterType: string;
        value: any;
      }>;
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    isPaid: '',
    page: 1,
    limit: 10
  });
  const [activeTab, setActiveTab] = useState('orders');
  const [parameters, setParameters] = useState<Array<{
    _id: string;
    name: string;
    type: 'select' | 'text' | 'number' | 'custom-range' | 'dimensions';
    options?: string[];
    required: boolean;
    allowCustom?: boolean;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
  }>>([]);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [editingParameter, setEditingParameter] = useState<any>(null);
  const [parameterForm, setParameterForm] = useState({
    name: '',
    type: 'select' as 'select' | 'text' | 'number' | 'custom-range' | 'dimensions',
    options: [] as string[],
    required: false,
    allowCustom: false,
    unit: '',
    min: 0,
    max: 1000,
    step: 1
  });
  const [newOption, setNewOption] = useState('');
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);

  useEffect(() => {
    // Check role from localStorage
    try {
      const persisted = localStorage.getItem('hastkari-store');
      if (persisted) {
        const state = JSON.parse(persisted).state;
        const user = state?.auth?.user;
        if (user && user.role === 'admin') {
          setIsAdmin(true);
          fetchParameters(); // Load parameters when admin panel loads
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
      // Build filter params, only include non-empty values
      const params: any = {
        page: orderFilters.page,
        limit: orderFilters.limit,
      };
      
      if (orderFilters.status) {
        params.status = orderFilters.status;
      }
      
      if (orderFilters.isPaid) {
        params.isPaid = orderFilters.isPaid;
      }
      
      const response = await ordersAPI.getAll(params);
      setOrders(response.orders || []);
      
      // Show success message when filters are applied
      if (orderFilters.status || orderFilters.isPaid) {
        const filterCount = (orderFilters.status ? 1 : 0) + (orderFilters.isPaid ? 1 : 0);
        toast.success(`Filters applied! Found ${response.orders?.length || 0} orders.`);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setOrderLoading(false);
    }
  }, [orderFilters]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (activeSection === 'products') {
          await fetchProducts();
          await fetchCategories();
        } else if (activeSection === 'categories') {
          await fetchCategories();
        } else if (activeSection === 'orders') {
          await fetchOrders();
          await fetchOrderStats();
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
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

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setCancellingOrder(true);
    try {
      const { ordersAPI } = await import('@/components/services/api');
      await ordersAPI.cancel(selectedOrder._id);
      // Update order status to cancelled with admin reason
      await ordersAPI.updateNegotiationNotes(selectedOrder._id, `Order cancelled by admin. Reason: ${cancelReason}`);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error('Failed to cancel order');
      console.error('Error cancelling order:', error);
    } finally {
      setCancellingOrder(false);
    }
  };

  // Parameter Management Functions
  const fetchParameters = async () => {
    try {
      const response = await parametersAPI.getAll();
      const parametersData = response.data || response || [];
      setParameters(parametersData);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      toast.error('Failed to load parameters');
    }
  };

  const handleParameterSubmit = async () => {
    if (!parameterForm.name.trim()) {
      toast.error('Parameter name is required');
      return;
    }

    if (parameterForm.type === 'select' && parameterForm.options.length === 0) {
      toast.error('Select parameters must have at least one option');
      return;
    }

    try {
      if (editingParameter) {
        await parametersAPI.update(editingParameter._id, parameterForm);
        toast.success('Parameter updated successfully');
      } else {
        await parametersAPI.create(parameterForm);
        toast.success('Parameter created successfully');
      }

      await fetchParameters();
      setShowParameterModal(false);
      setEditingParameter(null);
      setParameterForm({ name: '', type: 'select', options: [], required: false, allowCustom: false, unit: '', min: 0, max: 1000, step: 1 });
    } catch (error) {
      toast.error('Failed to save parameter');
      console.error('Error saving parameter:', error);
    }
  };

  const handleEditParameter = (parameter: any) => {
    setEditingParameter(parameter);
    setParameterForm({
      name: parameter.name,
      type: parameter.type,
      options: parameter.options || [],
      required: parameter.required,
      allowCustom: parameter.allowCustom || false,
      unit: parameter.unit || '',
      min: parameter.min || 0,
      max: parameter.max || 1000,
      step: parameter.step || 1
    });
    setShowParameterModal(true);
  };

  const handleDeleteParameter = async (parameterId: string) => {
    if (window.confirm('Are you sure you want to delete this parameter?')) {
      try {
        await parametersAPI.delete(parameterId);
        await fetchParameters();
        toast.success('Parameter deleted successfully');
      } catch (error) {
        toast.error('Failed to delete parameter');
        console.error('Error deleting parameter:', error);
      }
    }
  };

  const addOption = () => {
    if (newOption.trim() && !parameterForm.options.includes(newOption.trim())) {
      setParameterForm(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setParameterForm(prev => ({
      ...prev,
      options: prev.options.filter(o => o !== option)
    }));
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
        return 'bg-gray-100 text-dark-text-primary border-dark-border-primary';
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
    // Load the product's assigned parameters
    if (product.parameters && Array.isArray(product.parameters)) {
      const parameterIds = product.parameters.map((p: any) => 
        typeof p === 'string' ? p : p._id
      );
      setSelectedParameters(parameterIds);
    } else {
      setSelectedParameters([]);
    }
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
      
      // Add selected parameters
      if (selectedParameters.length > 0) {
        formData.append('parameters', JSON.stringify(selectedParameters));
      }
      
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
    setSelectedParameters([]);
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
      
      // Add selected parameters
      if (selectedParameters.length > 0) {
        formData.append('parameters', JSON.stringify(selectedParameters));
      }
      
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

  if (initialLoading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const navLinks = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'products', label: 'Products', icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'categories', label: 'Categories', icon: <Tag className="w-5 h-5" /> },
    { key: 'parameters', label: 'Parameters', icon: <Settings className="w-5 h-5" /> },
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
              <div className="stats-swiper-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-dark-bg-secondary rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-dark-bg-tertiary transition-colors">
                <svg className="w-4 h-4 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="stats-swiper-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-dark-bg-secondary rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-dark-bg-tertiary transition-colors">
                <svg className="w-4 h-4 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {products.length > 0 ? (
                  <div className="flex items-center space-x-3 p-3 bg-dark-bg-tertiary rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Products loaded successfully</p>
                      <p className="text-xs text-dark-text-secondary">{products.length} products available</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-dark-text-secondary">No recent activity to display.</p>
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
                  className="bg-dark-bg-secondary rounded-xl shadow-2xl w-full max-w-2xl universal-modal-container my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="universal-modal-header bg-dark-bg-secondary border-b border-dark-border-primary px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-dark-text-primary">Add New Product</h3>
                      <button 
                        onClick={() => setProductAdding(false)} 
                        className="text-gray-400 hover:text-dark-text-secondary transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="universal-modal-content p-6 space-y-6">
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
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter product name"
                          value={productAddForm.name}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder:text-dark-text-muted"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="sku"
                          placeholder="Enter SKU"
                          value={productAddForm.sku}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder:text-dark-text-muted"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter product description"
                        value={productAddForm.description}
                        onChange={handleProductAddChange}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors resize-none"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={productAddForm.category}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder:text-dark-text-muted"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-dark-text-secondary">$</span>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={productAddForm.price}
                            onChange={handleProductAddChange}
                            className="w-full p-3 pl-8 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="stock"
                          placeholder="0"
                          value={productAddForm.stock}
                          onChange={handleProductAddChange}
                          className="w-full p-3 border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder:text-dark-text-muted"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Product Parameters Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Product Parameters
                        </label>
                        <span className="text-xs text-dark-text-muted">
                          Select parameters that apply to this product
                        </span>
                      </div>
                      
                      {parameters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {parameters.map((parameter) => (
                            <div key={parameter._id} className="flex items-center gap-3 p-3 bg-dark-bg-tertiary rounded-lg border border-dark-border-primary hover:border-accent-500/30 transition-colors">
                              <input
                                type="checkbox"
                                id={`param-${parameter._id}`}
                                checked={selectedParameters.includes(parameter._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedParameters(prev => [...prev, parameter._id]);
                                  } else {
                                    setSelectedParameters(prev => prev.filter(id => id !== parameter._id));
                                  }
                                }}
                                className="w-4 h-4 text-accent-500 bg-dark-bg-primary border-dark-border-primary rounded focus:ring-accent-500"
                              />
                              <div className="flex-1 min-w-0">
                                <label htmlFor={`param-${parameter._id}`} className="flex items-center gap-2 cursor-pointer">
                                  <span className="text-sm font-medium text-dark-text-primary truncate">
                                    {parameter.name}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    parameter.required 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {parameter.required ? 'Required' : 'Optional'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    parameter.type === 'select' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : parameter.type === 'text'
                                      ? 'bg-green-100 text-green-800'
                                      : parameter.type === 'number'
                                      ? 'bg-purple-100 text-purple-800'
                                      : parameter.type === 'custom-range'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {parameter.type === 'custom-range' ? 'Custom Range' : 
                                     parameter.type === 'dimensions' ? 'Dimensions' :
                                     parameter.type.charAt(0).toUpperCase() + parameter.type.slice(1)}
                                  </span>
                                </label>
                                {parameter.type === 'select' && parameter.options && (
                                  <p className="text-xs text-dark-text-muted mt-1">
                                    Options: {parameter.options.slice(0, 2).join(', ')}{parameter.options.length > 2 ? ` +${parameter.options.length - 2} more` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-dark-bg-tertiary rounded-lg border border-dark-border-primary">
                          <div className="w-12 h-12 bg-dark-bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                            <Settings className="w-6 h-6 text-dark-text-muted" />
                          </div>
                          <p className="text-sm text-dark-text-secondary">No parameters available</p>
                          <p className="text-xs text-dark-text-muted">Create parameters in the Parameters section first</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="universal-modal-footer flex gap-3">
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
                        className="flex-1 bg-dark-bg-tertiary text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
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
                  className="bg-dark-bg-secondary rounded-xl shadow-2xl w-full max-w-2xl universal-modal-container my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="universal-modal-header bg-dark-bg-secondary border-b border-dark-border-primary px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-dark-text-primary">Edit Product</h3>
                      <button 
                        onClick={() => setProductEditing(null)} 
                        className="text-gray-400 hover:text-dark-text-secondary transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="universal-modal-content p-6 space-y-6">
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
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter product name"
                        value={productEditForm.name}
                        onChange={handleProductEditChange}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter product description"
                        value={productEditForm.description}
                        onChange={handleProductEditChange}
                        rows={3}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={productEditForm.category}
                          onChange={handleProductEditChange}
                          className="w-full p-3 border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder:text-dark-text-muted"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-dark-text-secondary">$</span>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={productEditForm.price}
                            onChange={handleProductEditChange}
                            className="w-full p-3 pl-8 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="stock"
                          placeholder="0"
                          value={productEditForm.stock}
                          onChange={handleProductEditChange}
                          className="w-full p-3 border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder:text-dark-text-muted"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Product Parameters Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-dark-text-secondary">
                          Product Parameters
                        </label>
                        <span className="text-xs text-dark-text-muted">
                          Select parameters that apply to this product
                        </span>
                      </div>
                      
                      {parameters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {parameters.map((parameter) => (
                            <div key={parameter._id} className="flex items-center gap-3 p-3 bg-dark-bg-tertiary rounded-lg border border-dark-border-primary hover:border-accent-500/30 transition-colors">
                              <input
                                type="checkbox"
                                id={`edit-param-${parameter._id}`}
                                checked={selectedParameters.includes(parameter._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedParameters(prev => [...prev, parameter._id]);
                                  } else {
                                    setSelectedParameters(prev => prev.filter(id => id !== parameter._id));
                                  }
                                }}
                                className="w-4 h-4 text-accent-500 bg-dark-bg-primary border-dark-border-primary rounded focus:ring-accent-500"
                              />
                              <div className="flex-1 min-w-0">
                                <label htmlFor={`edit-param-${parameter._id}`} className="flex items-center gap-2 cursor-pointer">
                                  <span className="text-sm font-medium text-dark-text-primary truncate">
                                    {parameter.name}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    parameter.required 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {parameter.required ? 'Required' : 'Optional'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    parameter.type === 'select' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : parameter.type === 'text'
                                      ? 'bg-green-100 text-green-800'
                                      : parameter.type === 'number'
                                      ? 'bg-purple-100 text-purple-800'
                                      : parameter.type === 'custom-range'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {parameter.type === 'custom-range' ? 'Custom Range' : 
                                     parameter.type === 'dimensions' ? 'Dimensions' :
                                     parameter.type.charAt(0).toUpperCase() + parameter.type.slice(1)}
                                  </span>
                                </label>
                                {parameter.type === 'select' && parameter.options && (
                                  <p className="text-xs text-dark-text-muted mt-1">
                                    Options: {parameter.options.slice(0, 2).join(', ')}{parameter.options.length > 2 ? ` +${parameter.options.length - 2} more` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-dark-bg-tertiary rounded-lg border border-dark-border-primary">
                          <div className="w-12 h-12 bg-dark-bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                            <Settings className="w-6 h-6 text-dark-text-muted" />
                          </div>
                          <p className="text-sm text-dark-text-secondary">No parameters available</p>
                          <p className="text-xs text-dark-text-muted">Create parameters in the Parameters section first</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="universal-modal-footer flex gap-3">
                    <button
                      onClick={handleProductEditSave}
                        disabled={productEditLoading || !productEditForm.name || !productEditForm.category || !productEditForm.price || !productEditForm.stock}
                        className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
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
                        className="flex-1 bg-dark-bg-tertiary text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                </div>
              </div>
            )}

            {/* Products List - Desktop Table */}
            <div className="hidden md:block">
              <div className="bg-dark-bg-secondary rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-dark-bg-tertiary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Featured</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-bg-secondary divide-y divide-gray-200">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-dark-text-secondary">
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
                                  <div className="text-sm font-medium text-dark-text-primary">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                              {typeof product.category === 'object' && product.category !== null 
                                ? (product.category as { _id: string; name: string }).name 
                                : categories.find(cat => cat._id === product.category)?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-primary">${product.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-primary">{product.stock}</td>
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
                                  className="bg-dark-bg-secondary text-blue-600 border border-blue-600 hover:bg-accent-500 hover:text-white transition-colors rounded p-1.5"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleProductDelete(product._id)}
                                  disabled={productDeleting === product._id}
                                  className="bg-dark-bg-secondary text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 disabled:opacity-50"
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
                <div className="text-center text-dark-text-secondary py-8">No products found. Add your first product!</div>
              ) : (
                products.map(product => (
                  <div key={product._id} className="bg-dark-bg-secondary rounded-lg shadow-md border border-dark-border-primary p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <Image src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder.png'} alt={product.name} className="w-16 h-16 object-cover rounded" width={64} height={64} />
                      <div>
                        <div className="font-semibold text-dark-text-primary">{product.name}</div>
                        <div className="text-xs text-dark-text-secondary">
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
                                      <button onClick={() => openProductEdit(product)} className="bg-accent-500 text-white border border-blue-600 hover:bg-accent-600 hover:text-white transition-colors rounded p-1.5 flex-1 shadow-sm">Edit</button>
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
                  className="bg-dark-bg-secondary rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-dark-bg-secondary border-b border-dark-border-primary px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-dark-text-primary">Add New Category</h3>
                      <button 
                        onClick={() => setCategoryAdding(false)} 
                        className="text-gray-400 hover:text-dark-text-secondary transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter category name"
                        value={categoryAddForm.name}
                        onChange={handleCategoryAddChange}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter category description (optional)"
                        value={categoryAddForm.description}
                        onChange={handleCategoryAddChange}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
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
                                }
                              }
                            }}
                            className="block w-full text-sm text-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                        {categoryAddForm.image && (
                          <div className="relative">
                            <Image src={categoryAddForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-dark-border-primary" width={80} height={80} />
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
                    <div className="flex gap-3 pt-4 border-t border-dark-border-primary">
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
                        className="flex-1 bg-dark-bg-tertiary text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
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
                  className="bg-dark-bg-secondary rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-dark-bg-secondary border-b border-dark-border-primary px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-dark-text-primary">Edit Category</h3>
                      <button 
                        onClick={() => setCategoryEditing(null)} 
                        className="text-gray-400 hover:text-dark-text-secondary transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter category name"
                        value={categoryEditForm.name}
                        onChange={handleCategoryEditChange}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter category description (optional)"
                        value={categoryEditForm.description}
                        onChange={handleCategoryEditChange}
                        className="w-full p-3 border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-dark-text-secondary">
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
                                }
                              }
                            }}
                            className="block w-full text-sm text-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                        {categoryEditForm.image && (
                          <div className="relative">
                            <Image src={categoryEditForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-dark-border-primary" width={80} height={80} />
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
                    <div className="flex gap-3 pt-4 border-t border-dark-border-primary">
                      <button
                        onClick={handleCategoryEditSave}
                        disabled={categoryEditLoading || !categoryEditForm.name}
                        className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
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
                        className="flex-1 bg-dark-bg-tertiary text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
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
              <div className="bg-dark-bg-secondary rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-dark-bg-tertiary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-bg-secondary divide-y divide-gray-200">
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-dark-text-secondary">
                            No categories found. Add your first category!
                          </td>
                        </tr>
                      ) : (
                        categories.map((category) => (
                          <tr key={category._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-dark-text-primary">{category.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-dark-text-secondary">{category.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openCategoryEdit(category)}
                                  className="bg-dark-bg-secondary text-blue-600 border border-blue-600 hover:bg-accent-500 hover:text-white transition-colors rounded p-1.5"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(category._id)}
                                  disabled={categoryDeleting === category._id}
                                  className="bg-dark-bg-secondary text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded p-1.5 disabled:opacity-50"
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
                <div className="text-center text-dark-text-secondary py-8">No categories found. Add your first category!</div>
              ) : (
                categories.map(category => (
                  <div key={category._id} className="bg-dark-bg-secondary rounded-lg shadow-md border border-dark-border-primary p-4 flex flex-col gap-2">
                    <div className="font-semibold text-dark-text-primary">{category.name}</div>
                    <div className="text-xs text-dark-text-secondary">{category.description}</div>
                    <div className="flex gap-2 mt-2">
                                      <button onClick={() => openCategoryEdit(category)} className="bg-accent-500 text-white border border-blue-600 hover:bg-accent-600 hover:text-white transition-colors rounded p-1.5 flex-1 shadow-sm">Edit</button>
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
            {/* Header with Title and Refresh Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-dark-text-primary">Order Management</h3>
              <button
                onClick={fetchOrders}
                disabled={orderLoading}
                className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 shadow-md"
              >
                <svg className={`w-4 h-4 ${orderLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {orderLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Order Statistics */}
            {orderStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{orderStats.totalOrders}</div>
                      <div className="text-sm opacity-90 mt-1">Total Orders</div>
                    </div>
                    <ShoppingBag className="h-10 w-10 opacity-80" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{orderStats.pendingOrders}</div>
                      <div className="text-sm opacity-90 mt-1">Pending Orders</div>
                    </div>
                    <FiPackage className="h-10 w-10 opacity-80" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{orderStats.deliveredOrders}</div>
                      <div className="text-sm opacity-90 mt-1">Delivered</div>
                    </div>
                    <svg className="h-10 w-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">₹{orderStats.totalRevenue?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm opacity-90 mt-1">Total Revenue</div>
                    </div>
                    <BarChart3 className="h-10 w-10 opacity-80" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-dark-bg-secondary border border-dark-border-primary rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-dark-text-primary">Filters</h4>
                </div>
                {(orderFilters.status || orderFilters.isPaid) && (
                  <span className="text-xs bg-accent-500 text-white px-3 py-1 rounded-full font-semibold">
                    {((orderFilters.status ? 1 : 0) + (orderFilters.isPaid ? 1 : 0))} Active
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                    Order Status
                    {orderFilters.status && (
                      <span className="ml-2 text-xs text-accent-500 font-semibold">• Active</span>
                    )}
                  </label>
                  <select
                    value={orderFilters.status}
                    onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value, page: 1 })}
                    className={`w-full border-2 bg-dark-bg-primary text-dark-text-primary rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      orderFilters.status ? 'border-accent-500' : 'border-dark-border-primary'
                    }`}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">🟡 Pending</option>
                    <option value="Processing">🔵 Processing</option>
                    <option value="Shipped">🟣 Shipped</option>
                    <option value="Delivered">🟢 Delivered</option>
                    <option value="Cancelled">🔴 Cancelled</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                    Payment Status
                    {orderFilters.isPaid && (
                      <span className="ml-2 text-xs text-accent-500 font-semibold">• Active</span>
                    )}
                  </label>
                  <select
                    value={orderFilters.isPaid}
                    onChange={(e) => setOrderFilters({ ...orderFilters, isPaid: e.target.value, page: 1 })}
                    className={`w-full border-2 bg-dark-bg-primary text-dark-text-primary rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      orderFilters.isPaid ? 'border-accent-500' : 'border-dark-border-primary'
                    }`}
                  >
                    <option value="">All Payments</option>
                    <option value="true">✅ Paid</option>
                    <option value="false">❌ Unpaid</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  {(orderFilters.status || orderFilters.isPaid) && (
                    <button
                      onClick={() => {
                        setOrderFilters({ status: '', isPaid: '', page: 1, limit: 10 });
                        toast.success('Filters cleared!');
                      }}
                      className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-red-700 transition-colors shadow-md flex items-center gap-2 font-medium"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(orderFilters.status || orderFilters.isPaid) && (
                <div className="mt-4 pt-4 border-t border-dark-border-primary">
                  <p className="text-xs text-dark-text-secondary mb-2 font-medium">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {orderFilters.status && (
                      <span className="inline-flex items-center gap-1.5 bg-accent-500/10 text-accent-500 px-3 py-1.5 rounded-full text-xs font-semibold border border-accent-500/20">
                        <span>Status: {orderFilters.status}</span>
                        <button
                          onClick={() => setOrderFilters({ ...orderFilters, status: '', page: 1 })}
                          className="hover:bg-accent-500/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {orderFilters.isPaid && (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-500/20">
                        <span>Payment: {orderFilters.isPaid === 'true' ? 'Paid' : 'Unpaid'}</span>
                        <button
                          onClick={() => setOrderFilters({ ...orderFilters, isPaid: '', page: 1 })}
                          className="hover:bg-green-500/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Orders List - Desktop Table View */}
            <div className="hidden md:block bg-dark-bg-secondary border border-dark-border-primary rounded-xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-dark-border-primary bg-dark-bg-tertiary">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-dark-text-primary flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-accent-500" />
                    Orders List
                  </h3>
                  <span className="text-sm text-dark-text-secondary">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              </div>
              
              {orderLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-accent-500 mx-auto"></div>
                  <p className="mt-4 text-dark-text-secondary font-medium">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <FiPackage className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
                  <p className="text-dark-text-secondary text-lg font-medium">No orders found.</p>
                  <p className="text-dark-text-muted text-sm mt-2">Orders will appear here once customers place them.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-dark-border-primary">
                    <thead className="bg-dark-bg-tertiary">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Items</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-bg-secondary divide-y divide-dark-border-primary">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-dark-bg-tertiary transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                              <span className="text-sm font-bold text-dark-text-primary">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
                                {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-dark-text-primary">{order.user?.name || 'N/A'}</div>
                                <div className="text-xs text-dark-text-muted">{order.user?.email || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                              <FiPackage className="w-3.5 h-3.5" />
                              {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              disabled={orderStatusUpdating === order._id}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all ${getStatusColor(order.orderStatus)} ${orderStatusUpdating === order._id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                              </span>
                              <button
                                onClick={() => handlePaymentStatusUpdate(order._id, !order.isPaid)}
                                disabled={paymentStatusUpdating === order._id}
                                className="text-xs px-2.5 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                {paymentStatusUpdating === order._id ? 'Updating...' : 'Toggle'}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-dark-text-primary">{formatDate(order.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="inline-flex items-center gap-1.5 bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Orders List - Mobile Card View */}
            <div className="md:hidden space-y-4">
              {orderLoading ? (
                <div className="p-12 text-center bg-dark-bg-secondary rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-accent-500 mx-auto"></div>
                  <p className="mt-4 text-dark-text-secondary font-medium">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center bg-dark-bg-secondary rounded-xl">
                  <FiPackage className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
                  <p className="text-dark-text-secondary text-lg font-medium">No orders found.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="bg-dark-bg-secondary border border-dark-border-primary rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-dark-text-primary">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold text-xs">
                          {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-dark-text-primary">{order.user?.name || 'N/A'}</p>
                          <p className="text-xs text-dark-text-muted">{order.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dark-text-secondary">{formatDate(order.createdAt)}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                          {order.orderItems?.length || 0} items
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </span>
                        <button
                          onClick={() => handlePaymentStatusUpdate(order._id, !order.isPaid)}
                          disabled={paymentStatusUpdating === order._id}
                          className="text-xs px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
                        >
                          {paymentStatusUpdating === order._id ? 'Updating...' : 'Toggle Payment'}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="w-full bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors text-sm font-medium shadow-md"
                    >
                      View Order Details
                    </button>
                  </div>
                ))
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
            <div className="bg-dark-bg-secondary rounded-lg p-6">
              <p className="text-dark-text-secondary">User management functionality coming soon.</p>
            </div>
          </div>
        );
      case 'parameters':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-dark-text-primary">Product Parameters</h3>
              <button
                onClick={() => setShowParameterModal(true)}
                className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Parameter
              </button>
            </div>

            {/* Parameters List */}
            <div className="grid gap-4">
              {parameters.map((parameter) => (
                <div key={parameter._id} className="bg-dark-bg-tertiary p-6 rounded-xl border border-dark-border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-dark-text-primary">{parameter.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parameter.required 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {parameter.required ? 'Required' : 'Optional'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parameter.type === 'select' 
                            ? 'bg-blue-100 text-blue-800'
                            : parameter.type === 'text'
                            ? 'bg-green-100 text-green-800'
                            : parameter.type === 'number'
                            ? 'bg-purple-100 text-purple-800'
                            : parameter.type === 'custom-range'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {parameter.type === 'custom-range' ? 'Custom Range' : 
                           parameter.type === 'dimensions' ? 'Dimensions' :
                           parameter.type.charAt(0).toUpperCase() + parameter.type.slice(1)}
                        </span>
                      </div>
                      
                      {/* Options Display */}
                      {(parameter.type === 'select' || parameter.type === 'custom-range') && parameter.options && (
                        <div className="mt-3">
                          <p className="text-sm text-dark-text-secondary mb-2">
                            {parameter.type === 'custom-range' ? 'Available Options:' : 'Options:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {parameter.options.map((option, index) => (
                              <span key={index} className="bg-dark-bg-primary px-3 py-1 rounded-lg text-sm text-dark-text-primary border border-dark-border-primary">
                                {option}
                              </span>
                            ))}
                          </div>
                          {parameter.type === 'custom-range' && parameter.allowCustom && (
                            <p className="text-xs text-green-600 mt-2">✓ Users can input custom values</p>
                          )}
                        </div>
                      )}

                      {/* Range/Unit Display */}
                      {(parameter.type === 'number' || parameter.type === 'dimensions') && (
                        <div className="mt-3">
                          <div className="flex items-center gap-4 text-sm text-dark-text-secondary">
                            {parameter.min !== undefined && (
                              <span>Min: {parameter.min}{parameter.unit ? ` ${parameter.unit}` : ''}</span>
                            )}
                            {parameter.max !== undefined && (
                              <span>Max: {parameter.max}{parameter.unit ? ` ${parameter.unit}` : ''}</span>
                            )}
                            {parameter.step && parameter.step !== 1 && (
                              <span>Step: {parameter.step}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditParameter(parameter)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteParameter(parameter._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {parameters.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-dark-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-2">No Parameters Yet</h3>
                  <p className="text-dark-text-secondary mb-4">Create your first product parameter to get started.</p>
                  <button
                    onClick={() => setShowParameterModal(true)}
                    className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors"
                  >
                    Add Parameter
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button className="bg-dark-bg-tertiary text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Save Settings
              </button>
            </div>
            <div className="bg-dark-bg-secondary rounded-lg p-6">
              <p className="text-dark-text-secondary">Settings functionality coming soon.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back to home */}
          {/* 1. Remove the 'Back to Home' link. */}
          {/* 2. Remove the 'Management Sections' box (the box with the section title and grid of nav buttons). */}
          {/* 3. Change the 'Admin Panel' text to a smaller size, e.g., 'text-base' or 'text-lg'. */}
          <h1 className="text-base font-bold text-dark-text-primary mb-4 mt-2">Admin Panel</h1>

          {/* Desktop Navigation Grid */}
          <div className="hidden md:grid grid-cols-6 gap-4 mb-6">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg font-semibold transition-colors border-2 shadow-md ${activeSection === link.key ? 'bg-dark-bg-secondary text-accent-500 border-accent-500 hover:bg-accent-500 hover:text-white shadow-lg' : 'bg-accent-500 text-white border-accent-500 hover:bg-accent-600 hover:text-white shadow-lg'}`}
              >
                {link.icon}
                <span className="mt-2 text-xs font-medium">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Tab Bar */}
          <div className="md:hidden flex items-center gap-2 px-2 py-2 overflow-x-auto bg-dark-bg-tertiary border-t border-dark-border-primary mb-4">
            {navLinks.map(link => (
                <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded font-semibold text-sm transition-colors shadow-sm ${activeSection === link.key ? 'bg-accent-500 text-white border border-accent-500 hover:bg-accent-600 shadow-md' : 'bg-dark-bg-secondary text-accent-500 border border-dark-border-primary hover:bg-accent-500 hover:text-white shadow-md'}`}
              >
                {link.icon}
                {link.label}
                </button>
              ))}
          </div>

          {/* Section Content */}
          <div className="bg-dark-bg-secondary rounded-lg shadow-lg p-6 border border-dark-border-primary">
            {renderSectionContent()}
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-bg-secondary rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-dark-border-primary"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-accent-500 to-primary-500 px-6 py-5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Order #{selectedOrder._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-white/80">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeOrderDetails}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div 
                  className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] modal-scrollable"
                  data-lenis-prevent
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {/* Status and Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-bg-tertiary p-5 rounded-xl border border-dark-border-primary">
                      <p className="text-sm font-medium text-dark-text-secondary mb-2">Order Status</p>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleOrderStatusUpdate(selectedOrder._id, e.target.value)}
                        disabled={orderStatusUpdating === selectedOrder._id}
                        className={`w-full text-sm font-semibold px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(selectedOrder.orderStatus)} ${orderStatusUpdating === selectedOrder._id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                      >
                        <option value="Pending">🟡 Pending</option>
                        <option value="Processing">🔵 Processing</option>
                        <option value="Shipped">🟣 Shipped</option>
                        <option value="Delivered">🟢 Delivered</option>
                        <option value="Cancelled">🔴 Cancelled</option>
                      </select>
                    </div>
                    <div className="bg-dark-bg-tertiary p-5 rounded-xl border border-dark-border-primary">
                      <p className="text-sm font-medium text-dark-text-secondary mb-2">Payment Status</p>
                      <div className="flex items-center gap-3">
                        <span className={`flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold ${selectedOrder.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedOrder.isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </span>
                        <button
                          onClick={() => handlePaymentStatusUpdate(selectedOrder._id, !selectedOrder.isPaid)}
                          disabled={paymentStatusUpdating === selectedOrder._id}
                          className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium shadow-md"
                        >
                          {paymentStatusUpdating === selectedOrder._id ? 'Updating...' : 'Toggle'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="bg-dark-bg-tertiary p-5 rounded-xl border border-dark-border-primary">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-accent-500" />
                        <h4 className="text-lg font-semibold text-dark-text-primary">Customer Info</h4>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold">
                          {selectedOrder.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-text-primary">{selectedOrder.user?.name || 'N/A'}</p>
                          <p className="text-sm text-dark-text-muted">{selectedOrder.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-dark-border-primary">
                        <p className="text-xs text-dark-text-secondary mb-1">Payment Method</p>
                        <p className="font-medium text-dark-text-primary">{selectedOrder.paymentMethod || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-dark-bg-tertiary p-5 rounded-xl border border-dark-border-primary">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-dark-text-primary">Shipping Address</h4>
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-semibold text-dark-text-primary">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-sm text-dark-text-secondary">{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                        <p className="text-sm text-dark-text-secondary">
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                        </p>
                        <p className="text-sm text-dark-text-secondary">{selectedOrder.shippingAddress?.country}</p>
                        <p className="text-sm text-dark-text-primary font-medium pt-2 border-t border-dark-border-primary mt-2">
                          📞 {selectedOrder.shippingAddress?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FiPackage className="w-5 h-5 text-accent-500" />
                      <h4 className="text-lg font-semibold text-dark-text-primary">Order Items</h4>
                      <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {selectedOrder.orderItems?.length || 0} items
                      </span>
                    </div>
                    <div className="space-y-3 bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border-primary">
                      {selectedOrder.orderItems?.map((item: {
                        name: string;
                        quantity: number;
                        price: number;
                        image?: string;
                        selectedParameters?: Array<{ parameterId: string; parameterName: string; parameterType: string; value: any }>;
                      }, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-dark-bg-primary rounded-lg hover:bg-dark-bg-secondary transition-colors">
                          <div className="w-16 h-16 bg-dark-bg-secondary rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-dark-border-primary">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} className="w-full h-full object-cover" width={64} height={64} />
                            ) : (
                              <FiPackage className="h-8 w-8 text-dark-text-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-dark-text-primary truncate">{item.name}</p>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              <p className="text-sm text-dark-text-secondary">
                                Qty: <span className="font-semibold text-dark-text-primary">{item.quantity}</span>
                              </p>
                              <p className="text-sm font-semibold">
                                {item.price !== undefined && item.price > 0 
                                  ? <span className="text-dark-text-primary">₹{item.price.toLocaleString()}</span>
                                  : <span className="text-orange-600">Negotiable</span>}
                              </p>
                              {item.price !== undefined && item.price > 0 && item.quantity > 1 && (
                                <p className="text-sm">
                                  <span className="text-dark-text-muted">Total:</span> <span className="font-semibold text-green-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </p>
                              )}
                            </div>
                            
                            {/* Display Selected Parameters */}
                            {item.selectedParameters && item.selectedParameters.length > 0 && (
                              <div className="mt-2 space-y-0.5 bg-dark-bg-secondary/50 p-2 rounded-lg">
                                <p className="text-xs font-medium text-accent-400 mb-1">Customer Specifications:</p>
                                {item.selectedParameters.map((param, idx) => (
                                  <div key={idx} className="text-xs text-dark-text-secondary flex items-center gap-1">
                                    <span className="font-medium text-accent-400">{param.parameterName}:</span>
                                    <span className="text-dark-text-primary font-semibold">
                                      {typeof param.value === 'object' && param.value !== null
                                        ? `${param.value.length || 0} × ${param.value.width || 0} × ${param.value.height || 0}`
                                        : param.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-xl p-6 border border-dark-border-primary">
                    <h4 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-accent-500" />
                      Order Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-dark-text-secondary">
                        <span>Items Total:</span>
                        <span className="font-semibold text-dark-text-primary">
                          {selectedOrder.itemsPrice ? `₹${selectedOrder.itemsPrice.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                      <div className="flex justify-between text-dark-text-secondary">
                        <span>Shipping:</span>
                        <span className="font-semibold text-dark-text-primary">
                          {selectedOrder.shippingPrice !== undefined 
                            ? (selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`) 
                            : 'TBD'}
                        </span>
                      </div>
                      <div className="flex justify-between text-dark-text-secondary">
                        <span>Tax (10%):</span>
                        <span className="font-semibold text-dark-text-primary">
                          {selectedOrder.taxPrice ? `₹${selectedOrder.taxPrice.toLocaleString()}` : 'TBD'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-dark-text-primary pt-3 border-t border-dark-border-primary">
                        <span>Grand Total:</span>
                        <span className="text-accent-500">
                          {selectedOrder.totalPrice ? `₹${selectedOrder.totalPrice.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Negotiation Notes */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-5 h-5 text-accent-500" />
                      <h4 className="text-lg font-semibold text-dark-text-primary">Negotiation Notes</h4>
                    </div>
                    <textarea
                      value={negotiationNotes}
                      onChange={(e) => setNegotiationNotes(e.target.value)}
                      placeholder="Add negotiation notes, pricing details, or special instructions..."
                      className="w-full p-4 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-xl resize-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all placeholder:text-dark-text-muted"
                      rows={5}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-border-primary">
                    <button
                      onClick={closeOrderDetails}
                      className="flex-1 px-6 py-3 text-dark-text-primary bg-dark-bg-tertiary border-2 border-dark-border-primary rounded-xl hover:bg-dark-bg-primary transition-colors font-medium"
                    >
                      Close
                    </button>
                    {selectedOrder.orderStatus !== 'Cancelled' && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => handleNegotiationNotesUpdate(selectedOrder._id)}
                      disabled={updatingNotes}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-xl hover:from-accent-600 hover:to-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center justify-center gap-2"
                    >
                      {updatingNotes ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Notes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Order Cancellation Modal */}
          {showCancelModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-bg-secondary rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-dark-border-primary"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Cancel Order</h3>
                      <p className="text-sm text-white/80">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Are you sure you want to cancel this order?</p>
                        <p className="text-sm text-red-700 mt-1">This action cannot be undone. The customer will be notified of the cancellation.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Cancellation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please provide a reason for cancelling this order..."
                      className="w-full p-4 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-dark-text-muted"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-dark-text-muted mt-1">This reason will be visible to the customer.</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-border-primary">
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelReason('');
                      }}
                      className="flex-1 px-6 py-3 text-dark-text-primary bg-dark-bg-tertiary border-2 border-dark-border-primary rounded-xl hover:bg-dark-bg-primary transition-colors font-medium"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancellingOrder || !cancelReason.trim()}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center justify-center gap-2"
                    >
                      {cancellingOrder ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Parameter Modal */}
          <UniversalModal
            isOpen={showParameterModal}
            onClose={() => {
              setShowParameterModal(false);
              setEditingParameter(null);
              setParameterForm({ name: '', type: 'select', options: [], required: false, allowCustom: false, unit: '', min: 0, max: 1000, step: 1 });
            }}
            title={editingParameter ? 'Edit Parameter' : 'Create Parameter'}
            subtitle="Configure product parameters"
            icon={<Settings className="w-5 h-5 text-accent-500" />}
            maxWidth="max-w-2xl"
          >
            <div className="p-6 space-y-6">
                  {/* Parameter Name */}
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Parameter Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={parameterForm.name}
                      onChange={(e) => setParameterForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Size, Color, Material"
                      className="w-full p-4 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all placeholder:text-dark-text-muted"
                    />
                  </div>

                  {/* Parameter Type */}
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Parameter Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={parameterForm.type}
                      onChange={(e) => setParameterForm(prev => ({ 
                        ...prev, 
                        type: e.target.value as 'select' | 'text' | 'number' | 'custom-range' | 'dimensions',
                        options: e.target.value === 'select' || e.target.value === 'custom-range' ? prev.options : []
                      }))}
                      className="w-full p-4 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    >
                      <option value="select">Select (Dropdown)</option>
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                      <option value="custom-range">Custom Range (Fixed + Custom)</option>
                      <option value="dimensions">Dimensions (Width x Height)</option>
                    </select>
                  </div>

                  {/* Options for Select and Custom Range Types */}
                  {(parameterForm.type === 'select' || parameterForm.type === 'custom-range') && (
                    <div>
                      <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            placeholder="Add new option"
                            className="flex-1 p-3 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all placeholder:text-dark-text-muted"
                            onKeyPress={(e) => e.key === 'Enter' && addOption()}
                          />
                          <button
                            onClick={addOption}
                            disabled={!newOption.trim()}
                            className="px-4 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                        </div>
                        
                        {parameterForm.options.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-dark-text-secondary">Current options:</p>
                            <div className="flex flex-wrap gap-2">
                              {parameterForm.options.map((option, index) => (
                                <span key={index} className="inline-flex items-center gap-2 bg-dark-bg-primary px-3 py-1 rounded-lg text-sm text-dark-text-primary border border-dark-border-primary">
                                  {option}
                                  <button
                                    onClick={() => removeOption(option)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Unit Configuration for Custom Range and Dimensions */}
                  {(parameterForm.type === 'custom-range' || parameterForm.type === 'dimensions' || parameterForm.type === 'number') && (
                    <div>
                      <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                        Unit (Optional)
                      </label>
                      <input
                        type="text"
                        value={parameterForm.unit}
                        onChange={(e) => setParameterForm(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="e.g., cm, ft, in, kg, etc."
                        className="w-full p-3 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all placeholder:text-dark-text-muted"
                      />
                    </div>
                  )}

                  {/* Min/Max Configuration for Number and Dimensions */}
                  {(parameterForm.type === 'number' || parameterForm.type === 'dimensions') && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                          Min Value
                        </label>
                        <input
                          type="number"
                          value={parameterForm.min}
                          onChange={(e) => setParameterForm(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                          className="w-full p-3 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                          Max Value
                        </label>
                        <input
                          type="number"
                          value={parameterForm.max}
                          onChange={(e) => setParameterForm(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                          className="w-full p-3 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                          Step
                        </label>
                        <input
                          type="number"
                          value={parameterForm.step}
                          onChange={(e) => setParameterForm(prev => ({ ...prev, step: parseInt(e.target.value) || 1 }))}
                          className="w-full p-3 border-2 border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Allow Custom Input Toggle */}
                  {parameterForm.type === 'custom-range' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="allowCustom"
                        checked={parameterForm.allowCustom}
                        onChange={(e) => setParameterForm(prev => ({ ...prev, allowCustom: e.target.checked }))}
                        className="w-4 h-4 text-accent-500 bg-dark-bg-tertiary border-dark-border-primary rounded focus:ring-accent-500"
                      />
                      <label htmlFor="allowCustom" className="text-sm font-medium text-dark-text-primary">
                        Allow users to input custom values
                      </label>
                    </div>
                  )}

                  {/* Required Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="required"
                      checked={parameterForm.required}
                      onChange={(e) => setParameterForm(prev => ({ ...prev, required: e.target.checked }))}
                      className="w-4 h-4 text-accent-500 bg-dark-bg-tertiary border-dark-border-primary rounded focus:ring-accent-500"
                    />
                    <label htmlFor="required" className="text-sm font-medium text-dark-text-primary">
                      Required parameter
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-border-primary">
                    <button
                      onClick={() => {
                        setShowParameterModal(false);
                        setEditingParameter(null);
                        setParameterForm({ name: '', type: 'select', options: [], required: false, allowCustom: false, unit: '', min: 0, max: 1000, step: 1 });
                      }}
                      className="flex-1 px-6 py-3 text-dark-text-primary bg-dark-bg-tertiary border-2 border-dark-border-primary rounded-xl hover:bg-dark-bg-primary transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleParameterSubmit}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-xl hover:from-accent-600 hover:to-primary-600 transition-all font-medium shadow-lg"
                    >
                      {editingParameter ? 'Update Parameter' : 'Create Parameter'}
                    </button>
                  </div>
            </div>
          </UniversalModal>
        </div>
      </div>
    </div>
  );
} 