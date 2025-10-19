'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

interface LenisProviderProps {
  children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      // Prevent Lenis from interfering with specific elements
      prevent: (node) => {
        // Prevent on elements with data-lenis-prevent attribute
        if (node.hasAttribute && node.hasAttribute('data-lenis-prevent')) {
          return true;
        }
        
        // Prevent on modals and their children
        if (node.closest && (
          node.closest('.modal-scrollable') ||
          node.closest('.universal-modal-container') ||
          node.closest('[role="dialog"]') ||
          node.closest('.fixed.inset-0') ||
          node.closest('.hamburger-scrollable') ||
          node.closest('.swiper') ||
          node.closest('.swiper-wrapper')
        )) {
          return true;
        }
        
        return false;
      },
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Add smooth scroll to anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const targetElement = document.querySelector(href) as HTMLElement;
          if (targetElement) {
            lenis.scrollTo(targetElement, {
              duration: 1.5,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Stop Lenis when modal is open
    const stopLenisOnModal = () => {
      const modals = document.querySelectorAll('.fixed.inset-0, [role="dialog"]');
      if (modals.length > 0) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    // Watch for modal changes
    const observer = new MutationObserver(stopLenisOnModal);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
} 