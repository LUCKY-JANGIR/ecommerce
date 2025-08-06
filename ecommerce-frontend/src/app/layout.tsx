import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/caveat/400.css';
import Header from "@/components/Header";
import HydrationProvider from "@/components/HydrationProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import LenisProvider from "@/components/LenisProvider";
import "@/app/fonts.css";
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Indian Handloom - Your Online Shop',
  description: 'A modern ecommerce experience',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-white min-h-screen" style={{ fontFamily: 'Playfair Display, Inter, sans-serif' }}>
        <Toaster position="top-right" />
        <ErrorBoundary>
          <LenisProvider>
            <HydrationProvider />
            <Header />
            {children}
          </LenisProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
