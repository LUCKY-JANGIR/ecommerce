"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { productsAPI } from "@/components/services/api";
import { Product } from "@/store/useStore";
import { useStore } from "@/store/useStore";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Minus, 
  Plus,
  Star as StarIcon,
  MessageCircle,
  Calendar,
  User,
  Edit,
  Trash2,
  ZoomIn,
  Heart,
  Share2,
  Package,
  Shield,
  Truck,
  CheckCircle,
  Info,
  Settings
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";
import ImageModal from "@/components/ImageModal";
import RecommendedProducts from "@/components/RecommendedProducts";
import { ProductDetailsSkeleton } from "@/components/ui/Skeleton";
import { getImagePreset } from "@/lib/cloudinary";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Parameter {
  _id: string;
  name: string;
  type: 'select' | 'text' | 'number' | 'custom-range' | 'dimensions';
  options?: string[];
  required: boolean;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  allowCustom?: boolean;
  description?: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<Record<string, any>>({});

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { addToCart, auth } = useStore();
  const cartItem = useStore((state) => state.cart.items.find((item) => item.product._id === (product?._id || '')));
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const { updateCartItemQuantity, removeFromCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productsAPI.getById(id as string);
        setProduct(data);
        
        // Fetch reviews
        const reviewsData = await productsAPI.getProductReviews(id as string);
        setReviews(reviewsData.reviews || []);

        // Set product parameters
        console.log('Product data received:', data);
        console.log('Product parameters:', data.parameters);
        if (data.parameters && data.parameters.length > 0) {
          console.log('Setting parameters:', data.parameters);
          setParameters(data.parameters);
        } else {
          console.log('No parameters found for this product');
        }
      } catch {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if required parameters are selected
    const requiredParams = parameters.filter(p => p.required);
    const missingParams = requiredParams.filter(p => !selectedParameters[p._id]);
    
    if (missingParams.length > 0) {
      toast.error(`Please select: ${missingParams.map(p => p.name).join(', ')}`);
      return;
    }
    
    // Convert selectedParameters object to SelectedParameter[] array
    const parameterArray = Object.keys(selectedParameters).map(parameterId => {
      const parameter = parameters.find(p => p._id === parameterId);
      return {
        parameterId,
        parameterName: parameter?.name || '',
        parameterType: parameter?.type || 'text',
        value: selectedParameters[parameterId]
      };
    });
    
    addToCart(product, 1, parameterArray.length > 0 ? parameterArray : undefined);
    toast.success("Item added to cart");
  };

  const handleReviewSubmitted = async () => {
    try {
      const reviewsData = await productsAPI.getProductReviews(id as string);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Failed to refresh reviews:', error);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await productsAPI.deleteProductReview(id as string, reviewId);
      toast.success('Review deleted successfully');
      handleReviewSubmitted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete review');
    }
  };

  const handleImageClick = () => {
    setIsImageModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-accent-500 fill-current' : 'text-dark-text-muted'
        }`}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-dark-text-primary mb-4">{error || "Product not found"}</h1>
          <Link
            href="/products"
            className="bg-accent-500 text-white px-6 py-3 rounded-2xl hover:bg-accent-600 transition-colors font-semibold shadow-lg"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-gradient-to-b from-dark-bg-secondary to-dark-bg-primary border-b border-dark-border-primary">
        <div className="container mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
        >
          <Link
            href="/products"
              className="flex items-center text-dark-text-muted hover:text-accent-500 transition-colors group"
          >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Products</span>
          </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-hover'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-hover transition-all"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
        </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Product Images Section */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-dark-bg-secondary rounded-3xl overflow-hidden shadow-2xl group">
              {images.length > 0 ? (
                <div className="relative w-full h-full cursor-pointer" onClick={handleImageClick}>
                  <Image
                    src={typeof images[selectedImage] === 'string' ? getImagePreset(images[selectedImage], 'full') : getImagePreset(images[selectedImage]?.url || '/placeholder-product.svg', 'full')}
                    alt={`${product.name} ${selectedImage + 1}`}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  
                  {/* Zoom Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-4">
                      <ZoomIn className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>

                  {/* Badge */}
                  {product.featured && (
                    <div className="absolute top-4 left-4 bg-accent-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      Featured
                    </div>
                  )}
                  
                  {product.stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      Out of Stock
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-bg-tertiary">
                  <Package className="w-24 h-24 text-dark-text-muted" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? getImagePreset(image, 'thumbnail') : getImagePreset(image?.url || '/placeholder-product.svg', 'thumbnail');
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square bg-dark-bg-secondary rounded-2xl overflow-hidden border-2 transition-all shadow-md hover:shadow-xl ${
                        selectedImage === index 
                          ? 'border-accent-500 ring-4 ring-accent-500/20 scale-105' 
                          : 'border-dark-border-primary hover:border-accent-300'
                      }`}
                    >
                         <Image
                           src={imageUrl}
                           alt={`${product.name} ${index + 1}`}
                           fill
                        className="object-contain"
                      />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-accent-500/20 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-accent-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Product Title & Rating */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-dark-text-primary leading-tight">
                {product.name}
              </h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {renderStars(Number(averageRating))}
                  <span className="text-lg font-semibold text-dark-text-primary">
                    {averageRating}
                  </span>
                </div>
                <span className="text-dark-text-muted">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
                {product.stock > 0 && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{product.stock} in stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-dark-bg-secondary to-dark-bg-tertiary rounded-2xl p-6 border border-dark-border-primary">
              {product.price === 0 ? (
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-accent-500">
                    Negotiable
                  </div>
                  <p className="text-dark-text-muted flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Contact us for pricing
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-dark-text-primary">
                    ₹{product.price.toLocaleString()}
                  </div>
                  <p className="text-dark-text-muted">Inclusive of all taxes</p>
                </div>
              )}
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-primary">
                <p className="text-sm text-dark-text-muted">Category</p>
                <p className="text-dark-text-primary font-semibold mt-1">{typeof product.category === 'string' ? product.category : product.category?.name}</p>
              </div>
              <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-primary">
                <p className="text-sm text-dark-text-muted">Added</p>
                <p className="text-dark-text-primary font-semibold mt-1">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              {product.featured && (
                <div className="bg-accent-500/10 rounded-2xl p-4 border border-accent-500/30">
                  <p className="text-sm text-accent-400">Badge</p>
                  <p className="text-accent-300 font-semibold mt-1">Featured Product</p>
                </div>
              )}
                </div>
                
            {/* Product Parameters - Redesigned */}
            {parameters.length > 0 && (
              <div className="bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-2xl p-6 border border-dark-border-primary">
                <h3 className="text-2xl font-bold text-dark-text-primary mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-accent-500" />
                  Customize Your Product
                </h3>
                <div className="space-y-6">
                  {parameters.map((param) => (
                    <div key={param._id} className="space-y-3">
                      <label className="flex items-center gap-2 text-base font-semibold text-dark-text-primary">
                        {param.name}
                        {param.required && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Required</span>
                        )}
                        {param.description && (
                          <span className="text-xs font-normal text-dark-text-muted">- {param.description}</span>
                        )}
                      </label>
                      
                      {/* Select Type */}
                      {param.type === 'select' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {param.options?.map((option) => (
                            <button
                              key={option}
                              onClick={() => setSelectedParameters({...selectedParameters, [param._id]: option})}
                              className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                                selectedParameters[param._id] === option
                                  ? 'bg-accent-500 text-white shadow-lg scale-105'
                                  : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-hover border border-dark-border-primary'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Custom Range Type */}
                      {param.type === 'custom-range' && (
                        <div className="space-y-3">
                          {param.options && param.options.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {param.options.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => setSelectedParameters({...selectedParameters, [param._id]: option})}
                                  className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                                    selectedParameters[param._id] === option
                                      ? 'bg-accent-500 text-white shadow-lg'
                                      : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-hover border border-dark-border-primary'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                          {param.allowCustom && (
                            <input
                              type="text"
                              placeholder={`Enter custom ${param.name.toLowerCase()}${param.unit ? ` (${param.unit})` : ''}`}
                              value={selectedParameters[param._id] || ''}
                              onChange={(e) => setSelectedParameters({...selectedParameters, [param._id]: e.target.value})}
                              className="w-full px-4 py-3 bg-dark-bg-tertiary text-dark-text-primary border-2 border-dark-border-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all placeholder:text-dark-text-muted"
                            />
                          )}
                        </div>
                      )}

                      {/* Number Type */}
                      {param.type === 'number' && (
                        <div className="relative">
                          <input
                            type="number"
                            min={param.min}
                            max={param.max}
                            step={param.step || 1}
                            value={selectedParameters[param._id] || ''}
                            onChange={(e) => setSelectedParameters({...selectedParameters, [param._id]: e.target.value})}
                            className="w-full px-4 py-3 bg-dark-bg-tertiary text-dark-text-primary border-2 border-dark-border-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                            placeholder={`${param.min || 0} - ${param.max || 100}`}
                          />
                          {param.unit && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-text-muted font-medium">
                              {param.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Text Type */}
                      {param.type === 'text' && (
                        <textarea
                          value={selectedParameters[param._id] || ''}
                          onChange={(e) => setSelectedParameters({...selectedParameters, [param._id]: e.target.value})}
                          className="w-full px-4 py-3 bg-dark-bg-tertiary text-dark-text-primary border-2 border-dark-border-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all resize-none placeholder:text-dark-text-muted"
                          placeholder={`Enter ${param.name.toLowerCase()}...`}
                          rows={3}
                        />
                      )}

                      {/* Dimensions Type */}
                      {param.type === 'dimensions' && (
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <input
                              type="number"
                              placeholder="Length"
                              min={param.min}
                              max={param.max}
                              step={param.step || 1}
                              onChange={(e) => {
                                const current = selectedParameters[param._id] || {};
                                setSelectedParameters({
                                  ...selectedParameters,
                                  [param._id]: { ...current, length: Number(e.target.value) }
                                });
                              }}
                              className="w-full px-3 py-3 bg-dark-bg-tertiary text-dark-text-primary border-2 border-dark-border-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-center"
                            />
                            <p className="text-xs text-dark-text-muted mt-1 text-center">L {param.unit && `(${param.unit})`}</p>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Width"
                              min={param.min}
                              max={param.max}
                              step={param.step || 1}
                              onChange={(e) => {
                                const current = selectedParameters[param._id] || {};
                                setSelectedParameters({
                                  ...selectedParameters,
                                  [param._id]: { ...current, width: Number(e.target.value) }
                                });
                              }}
                              className="w-full px-3 py-3 bg-dark-bg-tertiary text-dark-text-primary border-2 border-dark-border-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-center"
                            />
                            <p className="text-xs text-dark-text-muted mt-1 text-center">W {param.unit && `(${param.unit})`}</p>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Height"
                              min={param.min}
                              max={param.max}
                              step={param.step || 1}
                              onChange={(e) => {
                                const current = selectedParameters[param._id] || {};
                                setSelectedParameters({
                                  ...selectedParameters,
                                  [param._id]: { ...current, height: Number(e.target.value) }
                                });
                              }}
                              className="w-full px-3 py-3 bg-dark-bg-tertiary text-dark-text-primary border-2 border-dark-border-primary rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-center"
                            />
                            <p className="text-xs text-dark-text-muted mt-1 text-center">H {param.unit && `(${param.unit})`}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-dark-text-primary">About This Product</h3>
              <p className="text-dark-text-secondary leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {cartQuantity > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-dark-bg-secondary rounded-2xl border border-dark-border-primary overflow-hidden">
                  <button
                    onClick={() => {
                        if (cartQuantity === 1) {
                          removeFromCart(product._id);
                        } else {
                          updateCartItemQuantity(product._id, cartQuantity - 1);
                        }
                      }}
                      className="p-4 hover:bg-dark-bg-hover transition-colors"
                    >
                      <Minus className="h-5 w-5 text-dark-text-primary" />
                  </button>
                    <span className="px-6 text-lg font-semibold text-dark-text-primary">
                      {cartQuantity}
                    </span>
                  <button
                    onClick={() => {
                        if (cartQuantity < product.stock) {
                          updateCartItemQuantity(product._id, cartQuantity + 1);
                        } else {
                          toast.error('Maximum stock reached');
                        }
                      }}
                      className="p-4 hover:bg-dark-bg-hover transition-colors"
                    disabled={cartQuantity >= product.stock}
                  >
                      <Plus className="h-5 w-5 text-dark-text-primary" />
                  </button>
                </div>
                  
                  <Link
                    href="/cart"
                    className="flex-1 bg-accent-500 text-white py-4 px-6 rounded-2xl hover:bg-accent-600 transition-all font-semibold text-center shadow-lg hover:shadow-xl"
                  >
                    Go to Cart
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-accent-500 text-white py-4 px-6 rounded-2xl hover:bg-accent-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-bg-secondary rounded-2xl p-4 text-center border border-dark-border-primary">
                <Truck className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-text-secondary">Free Shipping</p>
              </div>
              <div className="bg-dark-bg-secondary rounded-2xl p-4 text-center border border-dark-border-primary">
                <Shield className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-text-secondary">Secure Payment</p>
              </div>
              <div className="bg-dark-bg-secondary rounded-2xl p-4 text-center border border-dark-border-primary">
                <Package className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-text-secondary">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="bg-dark-bg-secondary rounded-3xl p-8 border border-dark-border-primary">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-dark-text-primary mb-2">Customer Reviews</h2>
                <p className="text-dark-text-muted">See what our customers are saying</p>
              </div>
            {auth.isAuthenticated && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsReviewModalOpen(true);
                }}
                  className="bg-accent-500 text-white px-6 py-3 rounded-xl hover:bg-accent-600 transition-all font-semibold flex items-center gap-2"
              >
                  <MessageCircle className="h-5 w-5" />
                Write a Review
              </button>
            )}
          </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
                <p className="text-dark-text-muted text-lg">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-dark-bg-tertiary rounded-2xl p-6 border border-dark-border-primary">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                          <h4 className="font-semibold text-dark-text-primary">{review.user.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-dark-text-muted text-sm">
                          <Calendar className="w-4 h-4" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                        
                        {auth.user?._id === review.user._id && (
                          <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                              className="p-2 hover:bg-dark-bg-hover rounded-lg transition-colors"
                          >
                              <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                              className="p-2 hover:bg-dark-bg-hover rounded-lg transition-colors"
                          >
                              <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                    
                    <p className="text-dark-text-secondary leading-relaxed">{review.comment}</p>
                  </div>
              ))}
            </div>
              )}
            </div>
        </motion.div>

        {/* Recommended Products */}
        <div className="mt-20">
          <RecommendedProducts currentProductId={product._id} />
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        productId={id as string}
        productName={product?.name || ''}
        existingReview={editingReview ? {
          _id: editingReview._id,
          rating: editingReview.rating,
          comment: editingReview.comment
        } : undefined}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={images}
        initialIndex={selectedImage}
        productName={product.name}
      />
    </div>
  );
}
