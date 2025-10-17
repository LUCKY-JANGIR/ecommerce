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
  title: 'Hastkari - Handwoven Stories',
  description: 'Discover authentic Indian handlooms and traditional craftsmanship',
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
    <html lang="en" className="dark">
      <body className="bg-dark-bg-primary text-dark-text-primary min-h-screen transition-colors duration-300" style={{ fontFamily: 'Playfair Display, Inter, sans-serif' }}>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
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
