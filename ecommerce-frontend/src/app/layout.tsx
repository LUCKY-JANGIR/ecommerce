import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/caveat/400.css';
import HeroHeader from "@/components/HeroHeader";
import HydrationProvider from "@/components/HydrationProvider";
import "@/app/fonts.css";
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Indian Handloom - Your Online Shop',
  description: 'A modern ecommerce experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only show HeroHeader if not on the home page
  const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
  return (
    <html lang="en">
      <body className="bg-black min-h-screen" style={{ fontFamily: 'Playfair Display, Inter, sans-serif' }}>
        <HydrationProvider />
        {!isHomePage && <HeroHeader />}
        {children}
      </body>
    </html>
  );
}
