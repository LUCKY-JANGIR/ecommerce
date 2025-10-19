# Quick Styling Reference Guide

## 🚀 Quick Start Checklist

### Creating a New Modal

```typescript
import UniversalModal from '@/components/UniversalModal';

<UniversalModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Your Title"
  maxWidth="max-w-2xl"
>
  <div className="p-6">
    {/* Your content */}
  </div>
</UniversalModal>
```

### Preventing Lenis on an Element

```html
<div data-lenis-prevent>
  <!-- Lenis won't affect scrolling here -->
</div>
```

### Making a Container Scrollable (with visible scrollbar)

```html
<div className="modal-scrollable overflow-y-auto max-h-[500px]">
  <!-- Content -->
</div>
```

---

## 🎨 Common Patterns

### Responsive Text

```html
<h1 className="text-responsive-3xl">Heading</h1>
<p className="text-responsive-base">Paragraph</p>
```

### Responsive Spacing

```html
<div className="p-responsive">Content</div>
<div className="gap-responsive grid grid-responsive-3">Items</div>
```

### Dark Theme Colors

```html
<div className="bg-dark-bg-primary text-dark-text-primary border-dark-border-primary">
  Content
</div>
```

### Button Styles

```html
<!-- Primary -->
<button className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg transition-colors">
  Primary Action
</button>

<!-- Secondary -->
<button className="bg-dark-bg-tertiary hover:bg-dark-bg-hover text-dark-text-primary px-6 py-3 rounded-lg transition-colors">
  Secondary Action
</button>
```

---

## 🔧 Troubleshooting Quick Fixes

### Modal Not Scrolling?

1. Add `.universal-modal-container` to modal wrapper
2. Add `.universal-modal-content` to scrollable area
3. Add `data-lenis-prevent` to overlay

### Background Scrolling When Modal Open?

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

### Swiper Not Working?

```html
<div data-lenis-prevent>
  <Swiper>...</Swiper>
</div>
```

---

## 📐 Breakpoints

- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)
- `2xl`: 1536px (extra large)

---

## 🎭 Z-Index Layers

- Modals: `z-[9999]`
- Dropdowns: `z-50`
- Header: `z-50`
- Tooltips: `z-40`

---

## 🌈 Color Classes

### Primary (Terracotta)
- `bg-primary-500` / `text-primary-500`

### Accent (Gold)
- `bg-accent-500` / `text-accent-500`

### Heritage (Beige)
- `bg-heritage-500` / `text-heritage-500`

### Dark Theme
- `bg-dark-bg-primary` (darkest)
- `bg-dark-bg-secondary` (medium)
- `bg-dark-bg-tertiary` (lighter)

---

## ⚡ Animation Classes

```html
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="animate-glow">Glows</div>
<div className="animate-float">Floats</div>
```

---

## 📱 Mobile-Specific

### Touch Targets (44px minimum)

```html
<button className="min-h-[44px] min-w-[44px]">Button</button>
```

### Prevent Text Size Adjustment

```css
/* Already applied globally */
body {
  -webkit-text-size-adjust: 100%;
}
```

---

## 🚫 Common Mistakes

❌ **Don't**:
- Create modals without `UniversalModal`
- Forget `data-lenis-prevent` on Swiper
- Use fixed pixel values for responsive layouts
- Nest modals inside Lenis-controlled areas

✅ **Do**:
- Use `UniversalModal` for all modals
- Add `data-lenis-prevent` to interactive elements
- Use responsive utility classes
- Test on mobile devices

---

## 📚 Full Documentation

See `STYLING_SYSTEM_DOCUMENTATION.md` for complete details.


