"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { productsAPI } from "@/components/services/api";
import { Product } from "@/store/useStore";

export default function CategoryPage() {
  const { category } = useParams();
  // Ensure category is always a string
  const categoryStr = Array.isArray(category) ? category[0] : category;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getAll({ category: categoryStr });
        setProducts(response.products || []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categoryStr]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2 capitalize">
          {categoryStr?.toString().replace(/-/g, " ")}
        </h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-6 capitalize">
          Products
        </h2>
        {loading ? (
          <div className="text-accent">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-gold text-lg">No products found in this category.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 