"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log error to console or send to error tracking service
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-black text-gold">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-8">{error.message || "An unexpected error occurred. Please try again later."}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-gold text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
        >
          Try Again
        </button>
      </body>
    </html>
  );
} 