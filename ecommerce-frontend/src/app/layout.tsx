import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/caveat/400.css';

export const metadata: Metadata = {
  title: 'Indian Handloom - Your Online Shop',
  description: 'A modern ecommerce experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
