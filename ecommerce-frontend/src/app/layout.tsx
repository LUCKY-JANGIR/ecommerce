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
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Indian Handloom - Your Online Shop',
  description: 'A modern ecommerce experience',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/file.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
