"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { productsAPI } from "@/components/services/api";
import { Product } from "@/store/useStore";
import { useStore } from "@/store/useStore";
import { 
  Star, 
  Heart, 
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
  ZoomIn
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";
import ImageModal from "@/components/ImageModal";
import RecommendedProducts from "@/components/RecommendedProducts";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

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

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, auth } = useStore();
  const cartItem = useStore((state) => state.cart.items.find((item) => item.product._id === (product?._id || '')));
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const { updateCartItemQuantity, removeFromCart } = useStore();

  const isInWishlist = product ? wishlist.some(item => item._id === product._id) : false;

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
      } catch (err) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, 1);
    toast.success("Item added to cart");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const { auth } = useStore.getState();
    if (!auth.isAuthenticated || !auth.token) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }
    
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
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

  const renderNegotiable = () => (
    <span className="text-3xl font-serif font-bold text-accent-600 mb-6">Negotiable</span>
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-accent-500 fill-current' : 'text-heritage-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-primary-700 mb-4">{error || "Product not found"}</h1>
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
  const mainImage = typeof images[selectedImage] === 'string' 
    ? images[selectedImage] 
    : images[selectedImage]?.url || '/placeholder-product.svg';

  return (
    <div className="min-h-screen bg-background-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-12"
        >
          <Link
            href="/products"
            className="flex items-center text-text-muted hover:text-primary-700 mr-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
          <span className="text-text-muted">/</span>
          <span className="ml-4 text-primary-700 font-medium">{product.name}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Main Image Carousel */}
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                  nextEl: '.product-image-next',
                  prevEl: '.product-image-prev',
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                className="product-image-swiper rounded-3xl overflow-hidden shadow-lg"
              >
                {images.length > 0 ? (
                  images.map((image, index) => {
                    const imageUrl = typeof image === 'string' ? image : image?.url || '/placeholder-product.svg';
                    return (
                      <SwiperSlide key={index}>
                        <div className="relative aspect-square bg-white group cursor-pointer" onClick={handleImageClick}>
                          <Image
                            src={imageUrl}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {/* Zoom overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3">
                              <ZoomIn className="w-6 h-6 text-gray-800" />
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })
                ) : (
                  <SwiperSlide>
                    <div className="relative aspect-square bg-white group cursor-pointer" onClick={handleImageClick}>
                      <Image
                        src="/placeholder-product.svg"
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {/* Zoom overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <ZoomIn className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                )}
              </Swiper>
              
              {/* Custom Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <div className="product-image-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="product-image-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : image?.url || '/placeholder-product.svg';
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square bg-white rounded-2xl overflow-hidden border-2 transition-all shadow-lg group ${
                        selectedImage === index ? 'border-accent-500 shadow-xl' : 'border-heritage-200 hover:border-accent-300'
                      }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {/* Zoom overlay for thumbnails */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2">
                          <ZoomIn className="w-4 h-4 text-gray-800" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 mb-6">{product.name}</h1>
              <div className="flex items-center mb-8">
                <div className="flex items-center mr-8">
                  {renderStars(product.averageRating || 0)}
                  <span className="ml-4 text-text-secondary font-medium">
                    ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
                  </span>
                </div>
                <span className="text-text-secondary font-medium">
                  {product.numReviews || 0} {(product.numReviews || 0) === 1 ? 'review' : 'reviews'}
                </span>
              </div>
              {renderNegotiable()}
            </div>

            <div className="space-y-8">
              <p className="text-text-secondary leading-relaxed text-lg">{product.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <span className="text-text-secondary font-medium">SKU:</span>
                  <span className="text-primary-700 font-semibold">{product.sku}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-text-secondary font-medium">Category:</span>
                  <span className="text-primary-700 font-semibold">
                    {typeof product.category === 'object' && product.category !== null
                      ? product.category.name
                      : product.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-text-secondary font-medium">Stock:</span>
                  <span className={`font-semibold ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-6">
              {cartQuantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-accent-500 text-white py-4 px-8 rounded-2xl font-semibold hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center space-x-4 flex-1">
                  <button
                    onClick={() => {
                      if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                      else removeFromCart(product._id);
                    }}
                    className="p-4 bg-heritage-100 border border-heritage-200 text-primary-700 rounded-2xl hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-colors shadow-lg"
                  >
                    {cartQuantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                  </button>
                  <span className="px-8 font-semibold text-primary-700 text-xl">{cartQuantity}</span>
                  <button
                    onClick={() => {
                      if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                    }}
                    className="p-4 bg-heritage-100 border border-heritage-200 text-primary-700 rounded-2xl hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-colors shadow-lg"
                    disabled={cartQuantity >= product.stock}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )}
              <button
                onClick={handleWishlistToggle}
                className={`p-4 rounded-2xl border-2 transition-colors shadow-lg ${
                  isInWishlist
                    ? 'border-red-500 text-red-500 hover:bg-red-50'
                    : 'border-heritage-300 text-heritage-600 hover:border-accent-500 hover:text-accent-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24"
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif font-bold text-primary-700 flex items-center">
              <MessageCircle className="h-8 w-8 mr-4" />
              Customer Reviews
            </h2>
            {auth.isAuthenticated && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsReviewModalOpen(true);
                }}
                className="bg-accent-500 text-white px-8 py-4 rounded-2xl hover:bg-accent-600 transition-colors font-semibold shadow-lg"
              >
                Write a Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review, index) => (
                <motion.div 
                  key={review._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-heritage-200 rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-heritage-100 rounded-full flex items-center justify-center mr-6">
                        <User className="h-6 w-6 text-primary-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-700 text-lg">{review.user.name}</h4>
                        <div className="flex items-center mt-2">
                          {renderStars(review.rating)}
                          <span className="ml-4 text-text-secondary font-medium">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-text-muted">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      {auth.isAuthenticated && auth.user?._id === review.user._id && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-3 text-text-muted hover:text-primary-700 transition-colors rounded-xl hover:bg-heritage-100"
                            title="Edit review"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-3 text-text-muted hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-text-secondary text-lg leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-heritage-200 rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-heritage-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <MessageCircle className="h-12 w-12 text-heritage-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary-700 mb-6">No reviews yet</h3>
              <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">Be the first to review this product and share your experience with our community!</p>
              {auth.isAuthenticated ? (
                <button
                  onClick={() => {
                    setEditingReview(null);
                    setIsReviewModalOpen(true);
                  }}
                  className="bg-accent-500 text-white px-8 py-4 rounded-2xl hover:bg-accent-600 transition-colors font-semibold shadow-lg"
                >
                  Write a Review
                </button>
              ) : (
                <Link
                  href="/login"
                  className="bg-accent-500 text-white px-8 py-4 rounded-2xl hover:bg-accent-600 transition-colors font-semibold shadow-lg"
                >
                  Login to Review
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Recommended Products */}
        <RecommendedProducts
          currentProductId={product._id}
          currentProductName={product.name}
        />
      </div>

      {/* Review Modal */}
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

      {/* Image Modal */}
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