'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function UniversalModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "max-w-2xl",
  showCloseButton = true
}: UniversalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`bg-dark-bg-secondary rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden shadow-2xl border border-dark-border-primary flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 px-6 py-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-white/80">{subtitle}</p>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content - Always Scrollable */}
        <div className="flex-1 overflow-y-auto modal-scrollable">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

