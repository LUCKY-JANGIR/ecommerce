"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { productsAPI } from "@/services/api";
import { Product } from "@/store/useStore";
import { useStore } from "@/store/useStore";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productsAPI.getById(id as string);
        setProduct(data);
      } catch (err) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand">
        <Header />
        <div className="container mx-auto px-4 py-16 text-accent text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-sand">
        <Header />
        <div className="container mx-auto px-4 py-16 text-gold text-xl">{error || "Product not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-sand flex flex-col items-center">
            <img
              src={product.images[0]?.url || "/placeholder-product.jpg"}
              alt={product.images[0]?.alt || product.name}
              className="rounded-lg border-2 border-gold mb-4 w-full max-w-xs object-cover"
            />
            <div className="flex space-x-2 mt-2">
              {product.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.alt || product.name}
                  className="w-16 h-16 object-cover rounded border border-sand"
                />
              ))}
            </div>
          </div>
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-sand flex flex-col">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">{product.name}</h1>
            <p className="text-lg text-gold font-bold mb-2">₹{product.price}</p>
            <p className="text-primary-dark mb-2">Category: <span className="capitalize">{product.category}</span></p>
            <p className="mb-4 text-primary-dark">{product.description}</p>
            <div className="mb-4">
              <span className="font-semibold text-primary">Stock:</span> {product.stock > 0 ? `${product.stock} available` : <span className="text-red-600">Out of stock</span>}
            </div>
            <button
              onClick={() => addToCart(product, 1)}
              disabled={product.stock === 0}
              className="bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-6 py-3 transition-colors mt-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
        {/* Product Specifications & Reviews */}
        <div className="mt-12 grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-lg shadow p-6 border border-sand">
            <h2 className="text-xl font-display font-bold text-primary mb-4">Specifications</h2>
            <ul className="list-disc pl-6 text-primary-dark">
              {product.specifications.map((spec, idx) => (
                <li key={idx}><span className="font-semibold">{spec.name}:</span> {spec.value}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-sand">
            <h2 className="text-xl font-display font-bold text-primary mb-4">Reviews</h2>
            {product.reviews.length === 0 ? (
              <div className="text-gold">No reviews yet.</div>
            ) : (
              <ul className="space-y-4">
                {product.reviews.map((review) => (
                  <li key={review._id} className="border-b border-sand pb-2">
                    <div className="font-semibold text-primary-dark">{review.user.name}</div>
                    <div className="text-gold">Rating: {review.rating} / 5</div>
                    <div className="text-primary-dark">{review.comment}</div>
                    <div className="text-xs text-sand">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 