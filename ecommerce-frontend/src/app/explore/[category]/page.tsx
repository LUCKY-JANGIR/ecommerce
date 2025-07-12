"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  description: string;
}
interface Category {
  _id: string;
  name: string;
}

export default function CategoryProductsPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    fetch(`/api/categories/${categoryId}`)
      .then(res => res.json())
      .then(data => setCategory(data));
    fetch(`/api/products?category=${categoryId}`)
      .then(res => res.json())
      .then(data => setProducts(data.products || data))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-sand p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/explore" className="text-gold hover:underline mb-4 inline-block">&larr; Back to Categories</Link>
        <h1 className="text-3xl font-display font-bold text-gold mb-8">{category ? category.name : 'Category'}</h1>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map(prod => (
              <Link key={prod._id} href={`/products/${prod._id}`} className="group bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow border border-gold hover:-translate-y-1 duration-200">
                {prod.images && prod.images[0] ? (
                  <img src={prod.images[0].url} alt={prod.name} className="w-32 h-32 object-cover rounded mb-4 border-2 border-gold shadow-gold" />
                ) : (
                  <div className="w-32 h-32 rounded bg-sand flex items-center justify-center text-3xl text-gold font-bold mb-4 border-2 border-gold">{prod.name[0]}</div>
                )}
                <h2 className="text-lg font-bold text-primary mb-2 font-display group-hover:text-gold transition-colors">{prod.name}</h2>
                <div className="text-xl font-bold text-gold mb-2">₹{prod.price}</div>
                <p className="text-gray-600 text-center line-clamp-2">{prod.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 