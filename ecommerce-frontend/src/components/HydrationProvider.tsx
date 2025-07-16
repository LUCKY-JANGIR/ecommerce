"use client";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function HydrationProvider() {
  const setHydrated = useStore((state) => state.setHydrated);
  const logout = useStore((state) => state.logout);
  const auth = useStore((state) => state.auth);

  useEffect(() => {
    // Validate token on app startup
    const validateToken = () => {
      const token = auth.token;
      
      if (token) {
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
        } catch (error) {
          console.log('Token validation failed, logging out:', error);
          logout();
          return;
        }
      }
    };

    validateToken();
    setHydrated(true);
  }, [setHydrated, logout, auth.token]);

  return null;
} 