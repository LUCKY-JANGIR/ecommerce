"use client";
import { FiUser, FiShoppingCart, FiLogIn } from "react-icons/fi";
import { useStore } from '@/store/useStore';

export default function HeroHeader() {
  const { auth } = useStore();
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent shadow-none backdrop-blur-0">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-1 md:py-2 px-8 md:px-12 lg:px-16">
        <div className="text-base md:text-lg font-bold tracking-tight text-white select-none" style={{ fontFamily: 'Pacifico, Poppins, sans-serif', textShadow: '0 1px 8px #0008' }}>
          Indian Handloom
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="text-primary hover:text-secondary transition-colors duration-200 text-xs md:text-sm font-medium" style={{ textShadow: '0 1px 8px #0008' }}>
            Home
          </a>
          <a href="/products" className="text-primary hover:text-secondary transition-colors duration-200 text-xs md:text-sm font-medium" style={{ textShadow: '0 1px 8px #0008' }}>
            Shop
          </a>
          <a href="/cart" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs md:text-sm transition-colors" style={{ textShadow: '0 1px 8px #0008' }}>
            <FiShoppingCart className="text-lg" /> Cart
          </a>
          {auth.isAuthenticated ? (
            <a href="/profile" className="ml-2 px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs md:text-sm flex items-center gap-2 transition-colors" style={{ textShadow: '0 1px 8px #0008' }}>
              <FiUser className="text-lg" /> Profile
            </a>
          ) : (
            <a href="/login" className="ml-2 px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs md:text-sm flex items-center gap-2 transition-colors" style={{ textShadow: '0 1px 8px #0008' }}>
              <FiLogIn className="text-lg" /> Login
            </a>
          )}
        </div>
      </nav>
    </header>
  );
} 