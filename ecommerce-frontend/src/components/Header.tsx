'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut,
  Settings,
  Heart,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const { auth, cart, logout, sidebarOpen, setSidebarOpen, hydrated } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success('Logged out successfully');
  };

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Food'
  ];

  return (
    <header className="bg-primary text-gold shadow-lg border-b-4 border-gold font-display">
      {/* Top bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            🎉 Free shipping on orders over $50! Shop now
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-3xl font-bold tracking-wider flex items-center">
          <span className="mr-2">🕌</span> ShopEase
        </div>
        <nav className="flex space-x-6">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-gray-600 hover:text-gold transition-colors whitespace-nowrap text-sm"
            >
              {category}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {!hydrated ? (
            <div className="w-20 h-6 bg-gold/30 rounded animate-pulse" />
          ) : auth.isAuthenticated ? (
            <Link href="/profile" className="flex items-center px-3 py-1 rounded hover:bg-blue-100 transition-colors">
              <User className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Profile</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center px-3 py-1 rounded hover:bg-blue-100 transition-colors">
              <User className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search bar - Mobile */}
      <div className="md:hidden mt-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 overflow-x-auto py-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-gray-600 hover:text-gold transition-colors whitespace-nowrap text-sm"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {auth.isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="block py-2 text-gray-600 hover:text-blue-600"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block py-2 text-gray-600 hover:text-blue-600"
                      onClick={() => setSidebarOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block py-2 text-gray-600 hover:text-blue-600"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Wishlist
                    </Link>
                    {auth.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block py-2 text-gray-600 hover:text-blue-600"
                        onClick={() => setSidebarOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-gray-600 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 text-gray-600 hover:text-blue-600"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 