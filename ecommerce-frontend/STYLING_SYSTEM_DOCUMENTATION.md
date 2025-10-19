# Hastkari E-Commerce - Styling System Documentation

**Version:** 1.0.0  
**Last Updated:** October 19, 2025  
**Author:** Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Scrolling System](#scrolling-system)
4. [Modal & Popup System](#modal--popup-system)
5. [Global CSS Architecture](#global-css-architecture)
6. [Responsive Design System](#responsive-design-system)
7. [Color Palette & Theming](#color-palette--theming)
8. [Animation System](#animation-system)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This document provides comprehensive guidelines for the styling system used in the Hastkari E-Commerce application. It ensures consistency, maintainability, and proper functionality across all components.

### Key Principles

- **Consistency**: Use established patterns and components
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized for mobile and desktop
- **Maintainability**: Centralized styling rules

---

## Technology Stack

### Core Libraries

1. **Tailwind CSS** (v3.3.2)
   - Utility-first CSS framework
   - Custom configuration in `tailwind.config.ts`
   - Extended with custom colors, animations, and utilities

2. **Lenis** (v1.3.8)
   - Smooth scrolling library
   - Configured to exclude modals, Swiper, and specific elements
   - **Location**: `src/components/LenisProvider.tsx`

3. **Framer Motion** (v12.23.0)
   - Animation library
   - Used for page transitions, modal animations, and micro-interactions

4. **Swiper** (v11.2.10)
   - Touch slider library
   - Used for hero sections and image carousels
   - **Important**: Properly configured to work with Lenis

---

## Scrolling System

### Architecture

The application uses a **hybrid scrolling system**:

1. **Lenis Smooth Scrolling** (Main Page)
   - Applied globally for smooth, momentum-based scrolling
   - Automatically disabled when modals are open

2. **Native Scrolling** (Modals, Sidebars, Swiper)
   - Used for modals, popups, and interactive elements
   - Prevents conflicts with Lenis

### Lenis Configuration

**File**: `src/components/LenisProvider.tsx`

```typescript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
  prevent: (node) => {
    // Automatically prevents Lenis on:
    // - Elements with data-lenis-prevent
    // - Modals and their children
    // - Swiper elements
    // - Hamburger menu
  },
});
```

### Preventing Lenis on Specific Elements

Use the `data-lenis-prevent` attribute:

```html
<div data-lenis-prevent>
  <!-- Lenis will not intercept scroll events here -->
</div>
```

**Automatically Excluded Elements:**
- `.modal-scrollable`
- `.universal-modal-container`
- `[role="dialog"]`
- `.fixed.inset-0`
- `.hamburger-scrollable`
- `.swiper`
- `.swiper-wrapper`

### Scrollbar Visibility

**Global Rule**: Scrollbars are hidden by default using:

```css
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

*::-webkit-scrollbar {
  display: none !important;
}
```

**Exception Classes** (for modals and specific containers):

```css
.modal-scrollable,
.hamburger-scrollable,
.universal-modal-content {
  scrollbar-width: thin !important;
  -ms-overflow-style: auto !important;
}

.modal-scrollable::-webkit-scrollbar {
  display: block !important;
  width: 8px !important;
}
```

---

## Modal & Popup System

### UniversalModal Component

**File**: `src/components/UniversalModal.tsx`

The `UniversalModal` component is the **standard** for all modals in the application.

#### Features

✅ **Automatic Body Scroll Prevention**  
✅ **Lenis Integration** (automatically stops Lenis)  
✅ **Focus Trap** (keyboard navigation)  
✅ **Escape Key Support**  
✅ **Click Outside to Close**  
✅ **Accessible** (ARIA attributes)  
✅ **Responsive** (mobile-optimized)  
✅ **Scrollable Content** (with visible scrollbar)

#### Usage

```typescript
import UniversalModal from '@/components/UniversalModal';

<UniversalModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Modal Title"
  subtitle="Optional subtitle"
  icon={<Icon />}
  maxWidth="max-w-2xl" // Options: max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-4xl
  footer={
    <div className="flex gap-3">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  }
>
  {/* Modal content */}
</UniversalModal>
```

### Modal CSS Classes

#### `.universal-modal-container`

```css
.universal-modal-container {
  max-height: 90vh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}
```

#### `.universal-modal-header`

```css
.universal-modal-header {
  flex-shrink: 0 !important;
}
```

#### `.universal-modal-content`

```css
.universal-modal-content {
  flex: 1 !important;
  overflow-y: auto !important;
  scrollbar-width: thin !important;
  -webkit-overflow-scrolling: touch !important;
  touch-action: pan-y !important;
  overscroll-behavior: contain !important;
}
```

#### `.universal-modal-footer`

```css
.universal-modal-footer {
  flex-shrink: 0 !important;
  border-top: 1px solid #374151 !important;
  background: #1f2937 !important;
  padding: 1.5rem !important;
}
```

### Custom Modals

If you need to create a custom modal (not recommended), follow these rules:

1. **Add `data-lenis-prevent` attribute** to the overlay
2. **Add `role="dialog"` and `aria-modal="true"`**
3. **Prevent body scroll**:
   ```typescript
   useEffect(() => {
     if (isOpen) {
       document.body.style.overflow = 'hidden';
     }
     return () => {
       document.body.style.overflow = 'unset';
     };
   }, [isOpen]);
   ```
4. **Use z-index `z-[9999]`** to ensure it's above all other elements
5. **Add `.universal-modal-container` class** to the modal content
6. **Add `.universal-modal-content` class** to scrollable areas

---

## Global CSS Architecture

**File**: `src/app/globals.css`

### Layer Structure

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Custom Utilities

#### Responsive Text Sizes

```css
.text-responsive-xs { @apply text-xs sm:text-sm md:text-base; }
.text-responsive-sm { @apply text-sm sm:text-base md:text-lg; }
.text-responsive-base { @apply text-base sm:text-lg md:text-xl; }
.text-responsive-lg { @apply text-lg sm:text-xl md:text-2xl; }
.text-responsive-xl { @apply text-xl sm:text-2xl md:text-3xl; }
.text-responsive-2xl { @apply text-2xl sm:text-3xl md:text-4xl; }
.text-responsive-3xl { @apply text-3xl sm:text-4xl md:text-5xl; }
.text-responsive-4xl { @apply text-4xl sm:text-5xl md:text-6xl; }
```

#### Responsive Spacing

```css
.p-responsive { @apply p-4 sm:p-6 md:p-8; }
.px-responsive { @apply px-4 sm:px-6 md:px-8; }
.py-responsive { @apply py-4 sm:py-6 md:py-8; }
.gap-responsive { @apply gap-4 sm:gap-6 md:gap-8; }
.gap-responsive-sm { @apply gap-2 sm:gap-3 md:gap-4; }
```

#### Responsive Grids

```css
.grid-responsive-2 { @apply grid-cols-1 sm:grid-cols-2; }
.grid-responsive-3 { @apply grid-cols-1 sm:grid-cols-2 md:grid-cols-3; }
.grid-responsive-4 { @apply grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4; }
```

#### Container & Section

```css
.container-responsive { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
.section-responsive { @apply py-12 sm:py-16 md:py-20; }
```

---

## Responsive Design System

### Breakpoints (Tailwind Default)

```javascript
{
  'sm': '640px',   // Small devices (landscape phones)
  'md': '768px',   // Medium devices (tablets)
  'lg': '1024px',  // Large devices (desktops)
  'xl': '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px'  // 2X Extra large devices
}
```

### Mobile-First Approach

Always design for mobile first, then add breakpoints:

```html
<!-- ❌ Wrong -->
<div class="text-2xl sm:text-xl">

<!-- ✅ Correct -->
<div class="text-xl sm:text-2xl">
```

### Touch Targets

**Minimum size**: 44px × 44px (Apple HIG & Material Design)

```css
@media (max-width: 640px) {
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## Color Palette & Theming

### Brand Colors

**File**: `tailwind.config.ts`

#### Primary (Warm Terracotta)

```javascript
primary: {
  50: '#fef7f7',
  500: '#e85d5d', // Main brand color
  900: '#7f1d1d',
}
```

#### Accent (Heritage Gold)

```javascript
accent: {
  50: '#fefce8',
  500: '#d97706', // Saffron gold
  900: '#451a03',
}
```

#### Heritage (Earthy Beige)

```javascript
heritage: {
  50: '#fdf8f6',
  500: '#bfa094', // Natural cotton
  900: '#43302b',
}
```

### Dark Theme Colors

```javascript
dark: {
  bg: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    muted: '#9ca3af',
  },
  border: {
    primary: '#374151',
    secondary: '#4b5563',
  },
}
```

### Usage

```html
<div class="bg-dark-bg-primary text-dark-text-primary border-dark-border-primary">
  Content
</div>
```

---

## Animation System

### Framer Motion Variants

**Common Patterns:**

#### Fade In

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

#### Scale In (Modals)

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
```

#### Stagger Children

```typescript
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    />
  ))}
</motion.div>
```

### Tailwind Animations

**File**: `tailwind.config.ts`

```javascript
animation: {
  'fade-in': 'fadeIn 0.6s ease-out',
  'slide-up': 'slideUp 0.4s ease-out',
  'slide-down': 'slideDown 0.4s ease-out',
  'glow': 'glow 2s ease-in-out infinite alternate',
  'float': 'float 3s ease-in-out infinite',
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

---

## Best Practices

### 1. Modals & Popups

✅ **DO**:
- Use `UniversalModal` component
- Add `data-lenis-prevent` to custom modals
- Prevent body scroll when modal is open
- Use `z-[9999]` for modal overlays
- Add `role="dialog"` and `aria-modal="true"`

❌ **DON'T**:
- Create custom modal components without proper scroll handling
- Forget to restore body scroll on unmount
- Use inline styles for scroll prevention

### 2. Swiper Integration

✅ **DO**:
- Wrap Swiper in a container with `data-lenis-prevent`
- Use proper Swiper modules (Navigation, Pagination, Autoplay)
- Test touch interactions on mobile

❌ **DON'T**:
- Nest Swiper inside Lenis-controlled areas without prevention
- Use Swiper for simple image galleries (use native solutions)

### 3. Responsive Design

✅ **DO**:
- Use responsive utility classes (`.text-responsive-lg`)
- Test on multiple devices and screen sizes
- Ensure touch targets are at least 44px

❌ **DON'T**:
- Use fixed pixel values for spacing
- Forget to test on mobile devices
- Ignore landscape orientation

### 4. Performance

✅ **DO**:
- Use `next/image` for all images
- Lazy load below-the-fold content
- Minimize use of heavy animations on mobile

❌ **DON'T**:
- Load all images at once
- Use unoptimized images
- Animate on scroll without throttling

---

## Troubleshooting

### Issue: Modal Not Scrolling

**Symptoms**: Modal content is not scrollable, or scrolling affects the background page.

**Solution**:
1. Ensure modal uses `.universal-modal-container` class
2. Add `.universal-modal-content` to scrollable area
3. Add `data-lenis-prevent` to modal overlay
4. Verify body scroll is prevented:
   ```typescript
   useEffect(() => {
     if (isOpen) {
       document.body.style.overflow = 'hidden';
     }
     return () => {
       document.body.style.overflow = 'unset';
     };
   }, [isOpen]);
   ```

### Issue: Swiper Not Working Properly

**Symptoms**: Swiper slides are not responding to touch/drag, or scrolling is jerky.

**Solution**:
1. Add `data-lenis-prevent` to Swiper container:
   ```html
   <div data-lenis-prevent>
     <Swiper>...</Swiper>
   </div>
   ```
2. Ensure Swiper modules are imported:
   ```typescript
   import { Navigation, Pagination, Autoplay } from 'swiper/modules';
   ```
3. Check Swiper CSS is imported:
   ```typescript
   import 'swiper/css';
   import 'swiper/css/navigation';
   import 'swiper/css/pagination';
   ```

### Issue: Background Scrolling When Modal is Open

**Symptoms**: Page scrolls behind the modal when scrolling inside the modal.

**Solution**:
1. Use `UniversalModal` component (handles this automatically)
2. For custom modals, add:
   ```typescript
   useEffect(() => {
     if (isOpen) {
       document.body.style.overflow = 'hidden';
     }
     return () => {
       document.body.style.overflow = 'unset';
     };
   }, [isOpen]);
   ```
3. Add `data-lenis-prevent` to modal overlay
4. Ensure modal has `z-[9999]`

### Issue: Scrollbar Not Visible in Modal

**Symptoms**: Modal content is scrollable but scrollbar is not visible.

**Solution**:
1. Add `.modal-scrollable` or `.universal-modal-content` class to scrollable element
2. Verify CSS is loaded:
   ```css
   .modal-scrollable::-webkit-scrollbar {
     display: block !important;
     width: 8px !important;
   }
   ```

### Issue: Lenis Not Working

**Symptoms**: Smooth scrolling is not applied, or page scrolls normally.

**Solution**:
1. Verify `LenisProvider` wraps the app in `layout.tsx`
2. Check browser console for Lenis errors
3. Ensure no conflicting scroll libraries
4. Test in incognito mode (browser extensions can interfere)

### Issue: Mobile Touch Scrolling Issues

**Symptoms**: Scrolling on mobile is not smooth or doesn't work.

**Solution**:
1. Add `-webkit-overflow-scrolling: touch` to scrollable elements
2. Use `touch-action: pan-y` for vertical scrolling
3. Add `overscroll-behavior: contain` to prevent pull-to-refresh
4. Ensure `data-lenis-prevent` is on mobile-specific scrollable areas

---

## File Structure

```
ecommerce-frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global CSS, scrollbar rules, utilities
│   │   └── layout.tsx            # LenisProvider wrapper
│   ├── components/
│   │   ├── LenisProvider.tsx     # Lenis configuration
│   │   ├── UniversalModal.tsx    # Standard modal component
│   │   ├── ReviewModal.tsx       # Product review modal
│   │   ├── PlatformReviewModal.tsx # Platform review modal
│   │   └── ImageModal.tsx        # Image lightbox modal
│   └── lib/
│       └── imageUtils.ts         # Image optimization utilities
├── tailwind.config.ts            # Tailwind configuration
└── STYLING_SYSTEM_DOCUMENTATION.md # This file
```

---

## Changelog

### Version 1.0.0 (October 19, 2025)

- Initial documentation
- Lenis integration with modal prevention
- UniversalModal component standardization
- Comprehensive scrolling system
- Responsive design utilities
- Color palette and theming
- Animation system guidelines

---

## Support

For questions or issues related to the styling system, please:

1. Check this documentation first
2. Review the [Troubleshooting](#troubleshooting) section
3. Check existing components for reference implementations
4. Contact the development team

---

**Remember**: Consistency is key. Always use established patterns and components before creating new ones.


