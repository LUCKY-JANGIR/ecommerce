"use client";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function HydrationProvider() {
  const setHydrated = useStore((state) => state.setHydrated);
  const logout = useStore((state) => state.logout);
  const auth = useStore((state) => state.auth);

  useEffect(() => {
    // Validate token on app startup only if user appears to be authenticated
    const validateToken = () => {
      const token = auth.token;
      
      if (token && auth.isAuthenticated && auth.user) {
        try {
          // Basic JWT format validation (without secret verification)
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.log('Invalid token format, logging out');
            logout();
            return;
          }

          // Check if token is expired (basic check)
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            console.log('Token expired, logging out');
            logout();
            return;
          }
          
          console.log('Token validation passed');
        } catch (error) {
          console.log('Token validation failed, logging out:', error);
          logout();
          return;
        }
      } else {
        console.log('No token or user not authenticated, skipping validation');
      }
    };

    // Small delay to ensure store is properly hydrated
    const timer = setTimeout(() => {
      validateToken();
      setHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [setHydrated, logout, auth.token, auth.isAuthenticated, auth.user]);

  return null;
} 