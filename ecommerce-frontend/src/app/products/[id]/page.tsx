"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

import { productsAPI } from "@/components/services/api";
import { Product } from "@/store/useStore";
import { useStore } from "@/store/useStore";
import { 
  ShoppingCart, 
  ArrowLeft, 
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

type ParameterValue = string | number | { length?: number; width?: number; height?: number };

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<Record<string, ParameterValue>>({});

  const getPrimitiveParameterValue = (parameterId: string): string | number | undefined => {
    const value = selectedParameters[parameterId];
    if (typeof value === 'object' && value !== null) {
      return undefined;
    }
    return value;
  };

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { addToCart, auth } = useStore();

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
    
    // Clear selected parameters after adding to cart
    setSelectedParameters({});
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
      {/* Sleek Header */}
      <div className="sticky top-0 z-40 bg-dark-bg-primary/95 backdrop-blur-xl border-b border-dark-border-primary/50">
        <div className="container mx-auto px-4 py-4">
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
        >
          <Link
            href="/products"
              className="flex items-center text-dark-text-muted hover:text-accent-500 transition-all group"
          >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
          </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-xl transition-all ${
                  isFavorite 
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25' 
                    : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-hover'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-hover transition-all"
                aria-label="Share this product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
        </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-xs text-dark-text-muted">
            <Link href="/" className="hover:text-accent-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-accent-500 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-dark-text-primary">{product.name}</span>
          </nav>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 xl:gap-8">
          {/* Product Images Section - 1/3 width */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-3"
          >
            {/* Main Image with AR Button */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-2xl overflow-hidden shadow-2xl border border-dark-border-primary/50 group">
              {images.length > 0 ? (
                <div className="relative w-full h-full cursor-pointer" onClick={handleImageClick}>
                  <Image
                    src={typeof images[selectedImage] === 'string' ? getImagePreset(images[selectedImage], 'full') : getImagePreset(images[selectedImage]?.url || '/placeholder-product.svg', 'full')}
                    alt={`${product.name} ${selectedImage + 1}`}
                    fill
                    className="object-contain transition-all duration-300 group-hover:scale-105"
                    priority
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                  
                  {/* Sharp Zoom Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl">
                      <ZoomIn className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>

                  {/* Sharp Badges */}
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg">
                      Featured
                    </div>
                  )}
                  
                  {product.stock === 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg">
                      Out of Stock
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-500/10 to-primary-500/10">
                  <Package className="w-12 h-12 text-accent-500" />
                </div>
              )}
              </div>
              
            </div>

            {/* Sleek Thumbnail Gallery */}
            {images.length > 1 && (
              <div
                className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-2 lg:overflow-x-visible lg:pb-0 lg:mx-0"
                data-lenis-prevent
                aria-label="Product image thumbnails"
              >
                {images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? getImagePreset(image, 'thumbnail') : getImagePreset(image?.url || '/placeholder-product.svg', 'thumbnail');
                  const isSelected = selectedImage === index;
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 aspect-square min-w-[72px] bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-xl overflow-hidden border transition-all duration-200 snap-start ${
                        isSelected 
                          ? 'border-accent-500 ring-2 ring-accent-500/30 scale-105 shadow-lg shadow-accent-500/20' 
                          : 'border-dark-border-primary/50 hover:border-accent-300/50 hover:scale-[1.02]'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`View ${product.name} image ${index + 1}`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width:1024px) 72px, 96px"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-accent-500/10 flex items-center justify-center">
                          <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Details Section - 2/3 width */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-8 xl:gap-10 space-y-6 lg:space-y-0">
              <section className="space-y-4">
                {/* Sharp Header */}
                <div className="space-y-2">
                  <h1 className="text-2xl xl:text-3xl font-bold text-dark-text-primary leading-tight">
                    {product.name}
                  </h1>
                  
                  {/* Product Category */}
                  <div className="flex items-center gap-3 text-xs text-dark-text-muted flex-wrap">
                    <span>{typeof product.category === 'string' ? product.category : product.category?.name}</span>
                    <Link 
                      href="/products" 
                      className="text-accent-500 hover:text-accent-400 transition-colors font-medium"
                    >
                      View Collection
                    </Link>
                  </div>
                  
                  {/* Compact Rating & Stock */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {renderStars(Number(averageRating))}
                      <span className="text-sm font-semibold text-dark-text-primary">
                        {averageRating}
                      </span>
                      <span className="text-xs text-dark-text-muted">
                        ({reviews.length})
                      </span>
                    </div>
                    {product.stock > 0 ? (
                      <div className="flex items-center gap-1.5 text-green-500 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{product.stock} in stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium">Out of stock</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Details */}
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <div className="flex items-center gap-2 text-dark-text-muted">
                    <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
                    <span>{typeof product.category === 'string' ? product.category : product.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-text-muted">
                    <span className="w-1.5 h-1.5 bg-dark-text-muted rounded-full"></span>
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                  {product.featured && (
                    <div className="flex items-center gap-2 text-accent-500">
                      <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
                      <span className="font-medium">Featured</span>
                    </div>
                  )}
                </div>

                {/* Concise Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-dark-text-primary">Description</h3>
                  <p className="text-xs text-dark-text-secondary leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Share Button */}
                <div className="flex justify-start lg:justify-end">
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs text-dark-text-muted hover:text-accent-500 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
              </section>

              <aside className="space-y-4 lg:sticky lg:top-28">
                {/* Sharp Price Card */}
                <div className="bg-gradient-to-r from-dark-bg-secondary to-dark-bg-tertiary rounded-xl p-4 border border-dark-border-primary/50">
                  {product.price === 0 ? (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-accent-500">
                        Negotiable
                      </div>
                      <p className="text-xs text-dark-text-muted flex items-center gap-1.5">
                        <Info className="w-3 h-3" />
                        Contact for pricing
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-dark-text-primary">
                        ₹{product.price.toLocaleString()}
                      </div>
                      <p className="text-xs text-dark-text-muted">All taxes included</p>
                    </div>
                  )}
                </div>

                {/* Sleek Parameters */}
                {parameters.length > 0 && (
                  <div className="bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-xl p-4 border border-dark-border-primary/50">
                    <h3 className="text-base font-bold text-dark-text-primary mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-accent-500" />
                      Customize
                    </h3>
                    <div className="space-y-3">
                      {parameters.map((param) => (
                        <div key={param._id} className="space-y-1.5">
                          <label className="flex items-center gap-2 text-xs font-semibold text-dark-text-primary">
                            {param.name}
                            {param.required && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-md">Required</span>
                            )}
                            {param.description && (
                              <span className="text-xs font-normal text-dark-text-muted">- {param.description}</span>
                            )}
                          </label>
                          
                          {/* Sleek Select Type */}
                          {param.type === 'select' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {param.options?.map((option) => (
                                <button
                                  type="button"
                                  key={option}
                                  onClick={() => setSelectedParameters({...selectedParameters, [param._id]: option})}
                                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-xs ${
                                    selectedParameters[param._id] === option
                                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 scale-105'
                                      : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-hover border border-dark-border-primary/50'
                                  }`}
                                  aria-pressed={selectedParameters[param._id] === option}
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
                                      type="button"
                                      key={option}
                                      onClick={() => setSelectedParameters({...selectedParameters, [param._id]: option})}
                                      className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                                        selectedParameters[param._id] === option
                                          ? 'bg-accent-500 text-white shadow-lg'
                                          : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-hover border border-dark-border-primary'
                                      }`}
                                      aria-pressed={selectedParameters[param._id] === option}
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
                                  value={getPrimitiveParameterValue(param._id) ?? ''}
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
                                value={getPrimitiveParameterValue(param._id) ?? ''}
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
                              value={getPrimitiveParameterValue(param._id) ?? ''}
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
                                    const existing = selectedParameters[param._id];
                                    const current = typeof existing === 'object' && existing !== null ? existing : {};
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
                                    const existing = selectedParameters[param._id];
                                    const current = typeof existing === 'object' && existing !== null ? existing : {};
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
                                    const existing = selectedParameters[param._id];
                                    const current = typeof existing === 'object' && existing !== null ? existing : {};
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

                {/* Sleek Add to Cart */}
                <div className="space-y-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-accent-500 text-white py-3 px-4 rounded-xl hover:bg-accent-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  
                  <Link
                    href="/cart"
                    className="w-full bg-dark-bg-secondary text-dark-text-primary py-2.5 px-4 rounded-xl hover:bg-dark-bg-hover transition-all font-medium text-center border border-dark-border-primary/50 flex items-center justify-center gap-2 text-xs"
                  >
                    View Cart
                  </Link>
                </div>

                {/* Compact Features */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-dark-text-muted">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-accent-500" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-accent-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-accent-500" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>

        </div>

        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-dark-bg-secondary rounded-2xl p-6 border border-dark-border-primary">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-dark-text-primary mb-1">Customer Reviews</h2>
                <p className="text-xs text-dark-text-muted">See what our customers are saying</p>
              </div>
            {auth.isAuthenticated && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsReviewModalOpen(true);
                }}
                  className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-all font-semibold flex items-center gap-2 text-sm"
              >
                  <MessageCircle className="h-4 w-4" />
                Write a Review
              </button>
            )}
          </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-dark-text-muted mx-auto mb-3" />
                <p className="text-dark-text-muted text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-dark-bg-tertiary rounded-xl p-4 border border-dark-border-primary">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                          <h4 className="font-semibold text-sm text-dark-text-primary">{review.user.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-dark-text-muted text-xs">
                          <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                        
                        {auth.user?._id === review.user._id && (
                          <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditReview(review)}
                              className="p-1.5 hover:bg-dark-bg-hover rounded-lg transition-colors"
                          >
                              <Edit className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                              className="p-1.5 hover:bg-dark-bg-hover rounded-lg transition-colors"
                          >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                    
                    <p className="text-xs text-dark-text-secondary leading-relaxed">{review.comment}</p>
                  </div>
              ))}
            </div>
              )}
            </div>
        </motion.div>

        {/* Recommended Products */}
        <div className="mt-12">
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
