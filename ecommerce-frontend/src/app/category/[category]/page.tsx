"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { productsAPI } from "@/components/services/api";
import { categoriesAPI } from "@/components/services/api";
import { Product } from "@/store/useStore";

interface Category {
  _id: string;
  name: string;
  image: string;
  description?: string;
}

export default function CategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  // Decode the category name from URL
  const categoryStr = Array.isArray(category) ? category[0] : category;
  const decodedCategory = decodeURIComponent(categoryStr || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories for the radio selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
    
        const response = await productsAPI.getAll({ 
          category: decodedCategory,
          limit: 50 // Get more products for category pages
        });
        

        
        // Handle different response structures
        let productsArray = [];
        if (response && response.products) {
          productsArray = response.products;
        } else if (response && response.data && response.data.products) {
          productsArray = response.data.products;
        } else if (Array.isArray(response)) {
          productsArray = response;
        }
        

        setProducts(productsArray);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (decodedCategory) {
      fetchCategoryProducts();
    }
  }, [decodedCategory]);

  const handleCategoryChange = (categoryName: string) => {
    const encodedCategory = encodeURIComponent(categoryName);
    router.push(`/category/${encodedCategory}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Category Radio Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
            Browse Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`flex flex-col items-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  cat.name === decodedCategory ? 'ring-4 ring-accent-500' : ''
                }`}
                onClick={() => handleCategoryChange(cat.name)}
              >
                <div className="relative">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                    cat.name === decodedCategory 
                      ? 'border-accent-500 shadow-lg' 
                      : 'border-gray-200 hover:border-accent-300'
                  }`}>
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center">
                        <span className="text-accent-600 font-semibold text-lg">
                          {cat.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Radio indicator */}
                  <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    cat.name === decodedCategory
                      ? 'bg-accent-500 border-white'
                      : 'bg-white border-gray-300'
                  }`}>
                    {cat.name === decodedCategory && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
                <span className={`text-sm md:text-base font-medium mt-2 text-center transition-colors duration-300 ${
                  cat.name === decodedCategory 
                    ? 'text-accent-600' 
                    : 'text-text-primary hover:text-accent-500'
                }`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Title and Products */}
        <div className="border-t border-gray-200 pt-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 mb-2 capitalize">
            {decodedCategory?.replace(/-/g, " ")}
          </h1>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Products
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-accent-600 text-lg">Loading products...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-error text-lg mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-accent-600 text-white px-6 py-2 rounded-lg hover:bg-accent-700"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-text-muted text-lg mb-4">
                No products found in this category.
              </div>
              <div className="text-text-muted text-sm">
                Please check back later or browse other categories.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 