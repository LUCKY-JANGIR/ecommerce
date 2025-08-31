"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Bug,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log error to console or send to error tracking service
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Error Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
            We encountered an unexpected error. Don't worry, our team has been notified and we're working on it!
          </p>
          
          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left"
            >
              <div className="flex items-center mb-2">
                <Bug className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-semibold text-red-800">Error Details:</span>
              </div>
              <code className="text-sm text-red-700 break-all">{error.message}</code>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <button
            onClick={() => reset()}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors group"
          >
            <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-50 transition-colors border border-gray-200 group"
          >
            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Go Home
          </Link>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto"
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors group"
          >
            <Zap className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Reload Page
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-red-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-8 h-8 bg-yellow-200 rounded-full opacity-20 animate-ping delay-500"></div>
      </div>
    </div>
  );
} 