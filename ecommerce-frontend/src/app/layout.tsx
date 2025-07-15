import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/caveat/400.css';
import Header from "@/components/Header";
import HydrationProvider from "@/components/HydrationProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/app/fonts.css";
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'Indian Handloom - Your Online Shop',
  description: 'A modern ecommerce experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only show Header if not on the home page
  const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
  return (
    <html lang="en">
      <body className="bg-white min-h-screen" style={{ fontFamily: 'Playfair Display, Inter, sans-serif' }}>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" aria-label="Notifications" />
        <ErrorBoundary>
        <HydrationProvider />
        {!isHomePage && <Header />}
        {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
