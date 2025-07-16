"use client";
import { FiUser, FiShoppingCart, FiLogIn, FiShield, FiMenu, FiX } from "react-icons/fi";
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const { auth } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 md:px-8 lg:px-16">
        {/* Logo/Title */}
        <Link href="/" className="text-lg md:text-xl font-bold tracking-tight text-primary select-none font-display">
          Indian Handlooms
        </Link>
        {/* Center Nav (Desktop) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-4">
          <Link href="/" className="text-primary hover:text-blue-700 transition-colors font-semibold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary">Home</Link>
          <Link href="/categories" className="text-primary hover:text-blue-700 transition-colors font-semibold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary">Categories</Link>
          <Link href="/products" className="text-primary hover:text-blue-700 transition-colors font-semibold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary">Shop</Link>
        </div>
        {/* Right Icons (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/cart" className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Cart">
            <FiShoppingCart className="text-xl" />
          </Link>
                {auth.isAuthenticated ? (
                  <>
              <Link href="/profile" className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Profile">
                <FiUser className="text-xl" />
              </Link>
                    {auth.user?.role === 'admin' && (
                <Link href="/admin" className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Admin">
                  <FiShield className="text-xl" />
                </Link>
              )}
                  </>
                ) : (
            <Link href="/login" className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Login">
              <FiLogIn className="text-xl" />
            </Link>
                )}
        </div>
        {/* Hamburger for Mobile */}
        <button
          className="md:hidden flex items-center text-primary text-2xl focus:outline-none ml-2"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>
      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 shadow-lg z-50 animate-fadein border-b border-primary">
          <div className="flex flex-col items-center gap-2 py-4">
            <Link href="/" className="text-primary hover:text-blue-700 font-semibold px-4 py-2 rounded w-full text-center" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/categories" className="text-primary hover:text-blue-700 font-semibold px-4 py-2 rounded w-full text-center" onClick={() => setMenuOpen(false)}>Categories</Link>
            <Link href="/products" className="text-primary hover:text-blue-700 font-semibold px-4 py-2 rounded w-full text-center" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/cart" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors mt-2" aria-label="Cart" onClick={() => setMenuOpen(false)}>
              <FiShoppingCart className="text-xl" />
            </Link>
            {auth.isAuthenticated ? (
              <>
                <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors" aria-label="Profile" onClick={() => setMenuOpen(false)}>
                  <FiUser className="text-xl" />
                </Link>
                {auth.user?.role === 'admin' && (
                  <Link href="/admin" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors" aria-label="Admin" onClick={() => setMenuOpen(false)}>
                    <FiShield className="text-xl" />
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors" aria-label="Login" onClick={() => setMenuOpen(false)}>
                <FiLogIn className="text-xl" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 