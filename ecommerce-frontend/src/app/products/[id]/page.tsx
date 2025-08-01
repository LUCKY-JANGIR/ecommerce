"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
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
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";

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

  // Remove price display and replace with 'Negotiable' label
  const renderNegotiable = () => (
    <span className="text-3xl font-serif font-bold text-accent mb-6">Negotiable</span>
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-primary mb-4">{error || "Product not found"}</h1>
          <Link
            href="/products"
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors font-semibold"
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
    <div className="min-h-screen bg-background-light">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link
            href="/products"
            className="flex items-center text-muted hover:text-primary mr-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
          <span className="text-muted">/</span>
          <span className="ml-4 text-primary font-medium">{product.name}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-card border border-accent rounded-2xl shadow-lg overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                />
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
                      className={`relative aspect-square bg-card rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-accent shadow-lg' : 'border-gray-200 hover:border-accent'
                      }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
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
              <h1 className="text-4xl font-serif font-bold text-primary mb-4">{product.name}</h1>
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-6">
                  {renderStars(product.averageRating || 0)}
                  <span className="ml-3 text-muted font-medium">
                    ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
                  </span>
                </div>
                <span className="text-muted font-medium">
                  {product.numReviews || 0} {(product.numReviews || 0) === 1 ? 'review' : 'reviews'}
                </span>
              </div>
              {renderNegotiable()}
            </div>

            <div className="space-y-6">
              <p className="text-muted leading-relaxed text-lg">{product.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-muted font-medium">SKU:</span>
                  <span className="text-primary font-semibold">{product.sku}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-muted font-medium">Category:</span>
                  <span className="text-primary font-semibold">
                    {typeof product.category === 'object' && product.category !== null
                      ? product.category.name
                      : product.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-muted font-medium">Stock:</span>
                  <span className={`font-semibold ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {cartQuantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-primary text-white py-4 px-8 rounded-xl font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center space-x-2 flex-1">
                  <button
                    onClick={() => {
                      if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                      else removeFromCart(product._id);
                    }}
                    className="p-4 bg-card border border-accent text-primary rounded-xl hover:bg-accent hover:text-white transition-colors"
                  >
                    {cartQuantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                  </button>
                  <span className="px-6 font-semibold text-primary text-lg">{cartQuantity}</span>
                  <button
                    onClick={() => {
                      if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                    }}
                    className="p-4 bg-card border border-accent text-primary rounded-xl hover:bg-accent hover:text-white transition-colors"
                    disabled={cartQuantity >= product.stock}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )}
              <button
                onClick={handleWishlistToggle}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  isInWishlist
                    ? 'border-red-500 text-red-500 hover:bg-red-50'
                    : 'border-accent text-accent hover:bg-accent hover:text-white'
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
          className="mt-20"
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-serif font-bold text-primary flex items-center">
              <MessageCircle className="h-7 w-7 mr-3" />
              Customer Reviews
            </h2>
            {auth.isAuthenticated && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsReviewModalOpen(true);
                }}
                className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors font-semibold"
              >
                Write a Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div 
                  key={review._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-accent rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary text-lg">{review.user.name}</h4>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                          <span className="ml-3 text-muted font-medium">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-muted">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      {auth.isAuthenticated && auth.user?._id === review.user._id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-muted hover:text-primary transition-colors"
                            title="Edit review"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-muted hover:text-red-600 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted text-lg leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-accent rounded-2xl shadow-lg">
              <MessageCircle className="h-16 w-16 text-muted mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">No reviews yet</h3>
              <p className="text-muted text-lg mb-8">Be the first to review this product!</p>
              {auth.isAuthenticated ? (
                <button
                  onClick={() => {
                    setEditingReview(null);
                    setIsReviewModalOpen(true);
                  }}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-accent transition-colors font-semibold"
                >
                  Write a Review
                </button>
              ) : (
                <Link
                  href="/login"
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-accent transition-colors font-semibold"
                >
                  Login to Review
                </Link>
              )}
            </div>
          )}
        </motion.div>
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
    </div>
  );
} 