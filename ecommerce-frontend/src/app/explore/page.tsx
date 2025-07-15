"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { categoriesAPI } from "@/components/services/api";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-sand p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gold mb-8">Explore Categories</h1>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map(cat => (
              <Link key={cat._id} href={`/explore/${cat._id}`} className="group bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow border border-gold hover:-translate-y-1 duration-200">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-gold shadow-gold" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-sand flex items-center justify-center text-3xl text-gold font-bold mb-4 border-2 border-gold">{cat.name[0]}</div>
                )}
                <h2 className="text-xl font-bold text-primary mb-2 font-display group-hover:text-gold transition-colors">{cat.name}</h2>
                <p className="text-gray-600 text-center">{cat.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 