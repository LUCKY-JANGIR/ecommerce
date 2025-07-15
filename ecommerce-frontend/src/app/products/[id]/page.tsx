"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsAPI } from "@/components/services/api";
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
      <div className="min-h-screen bg-neutral-950">
        <div className="container mx-auto px-4 py-16 text-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="container mx-auto px-4 py-16 text-gold text-xl">{error || "Product not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="bg-black/40 backdrop-blur border-[#d4af37] rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-8 shadow-lg animate-fadein">
          {/* Product Images */}
          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 border border-neutral-800 flex flex-col items-center">
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
                  className="w-16 h-16 object-cover rounded border border-neutral-800"
                />
              ))}
            </div>
          </div>
          {/* Product Info */}
          <div className="bg-neutral-900 rounded-lg shadow-lg p-8 border border-neutral-800 flex flex-col">
            <h1 className="font-playfair text-3xl md:text-4xl text-[#d4af37] font-bold mb-2">{product.name}</h1>
            <p className="text-2xl text-[#d4af37] font-bold mb-4">₹{product.price}</p>
            <p className="text-gray-200 mb-2">Category: <span className="capitalize">{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</span></p>
            <p className="mb-4 text-gray-200">{product.description}</p>
            <div className="mb-4">
              <span className="font-semibold text-gold">Stock:</span> {product.stock > 0 ? `${product.stock} available` : <span className="text-red-600">Out of stock</span>}
            </div>
            <button
              onClick={() => addToCart(product, 1)}
              disabled={product.stock === 0}
              className="bg-[#d4af37] text-black rounded-lg px-6 py-3 font-bold shadow hover:bg-[#e6c385] transition-colors w-full md:w-auto"
            >
              Add to Cart
            </button>
          </div>
        </div>
        {/* Product Specifications & Reviews */}
        <div className="mt-12 grid md:grid-cols-2 gap-10">
          <div className="bg-neutral-900 rounded-lg shadow p-6 border border-neutral-800">
            <h2 className="text-xl font-display font-bold text-gold mb-4">Specifications</h2>
            <ul className="list-disc pl-6 text-white-dark">
              {product.specifications.map((spec, idx) => (
                <li key={idx}><span className="font-semibold">{spec.name}:</span> {spec.value}</li>
              ))}
            </ul>
          </div>
          <div className="bg-neutral-900 rounded-lg shadow p-6 border border-neutral-800">
            <h2 className="text-xl font-display font-bold text-gold mb-4">Reviews</h2>
            {product.reviews.length === 0 ? (
              <div className="text-gold">No reviews yet.</div>
            ) : (
              <ul className="space-y-4">
                {product.reviews.map((review) => (
                  <li key={review._id} className="border-b border-neutral-800 pb-2">
                    <div className="font-semibold text-white-dark">{review.user.name}</div>
                    <div className="text-gold">Rating: {review.rating} / 5</div>
                    <div className="text-white-dark">{review.comment}</div>
                    <div className="text-xs text-neutral-800">{new Date(review.createdAt).toLocaleDateString()}</div>
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