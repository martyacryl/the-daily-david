# 🎨 Styling Guide - Marriage Meeting Tool

## Overview
This guide covers the complete styling system, theming, and design patterns used throughout the Marriage Meeting Tool application.

## 🌙 **Dark Mode System**

### **Implementation**
- **Complete dark mode support** across all components
- **Dynamic theming** using `useAccentColor` hook
- **Consistent color schemes** for both light and dark themes
- **Theme persistence** in user settings

### **Color Patterns**
```typescript
// Text Colors
text-gray-900 dark:text-white          // Primary headings
text-gray-700 dark:text-gray-300       // Body text
text-gray-600 dark:text-gray-300       // Secondary text
text-gray-500 dark:text-gray-400       // Muted text
text-gray-400 dark:text-gray-500       // Placeholder text

// Background Colors
bg-white dark:bg-gray-800              // Card backgrounds
bg-slate-100 dark:bg-gray-700          // Secondary backgrounds
bg-slate-50 dark:bg-gray-900           // Page backgrounds

// Icon Colors
text-slate-600 dark:text-slate-300     // Default icons
text-blue-600 dark:text-blue-400       // Primary action icons
text-green-600 dark:text-green-400     // Success icons
text-red-600 dark:text-red-400         // Error/warning icons
text-purple-600 dark:text-purple-400   // Special feature icons
```

### **Gradient Backgrounds**
```typescript
// Main Container Gradients
bg-gradient-to-br from-slate-50 to-${getColor('bg')} dark:from-gray-900 dark:to-gray-800

// Card Gradients
bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20
bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20
```

## 🎨 **Accent Color System**

### **Dynamic Theming**
The app uses a dynamic accent color system that allows users to customize their theme:

```typescript
// useAccentColor Hook
const { getColor, accentColor, setAccentColor } = useAccentColor()

// Color Usage
className={`bg-${getColor('primary')} text-${getColor('primaryDark')}`}
```

### **Available Accent Colors**
- **Blue** (default): Professional, trustworthy
- **Purple**: Creative, spiritual
- **Green**: Growth, nature
- **Orange**: Energy, enthusiasm
- **Pink**: Love, relationships
- **Red**: Passion, urgency
- **Indigo**: Deep, thoughtful
- **Teal**: Balance, harmony

### **Color Mapping**
```typescript
// Primary colors
primary: 'blue-600' | 'purple-600' | 'green-600' | etc.
primaryDark: 'blue-700' | 'purple-700' | 'green-700' | etc.

// Background colors
bg: 'blue-50' | 'purple-50' | 'green-50' | etc.
bgDark: 'blue-900' | 'purple-900' | 'green-900' | etc.
```

## 📱 **Responsive Design**

### **Breakpoints**
```css
/* Mobile First Approach */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

### **Common Responsive Patterns**
```typescript
// Text Sizing
text-sm sm:text-base lg:text-lg

// Spacing
p-2 sm:p-4 lg:p-6

// Grid Layouts
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Flex Direction
flex-col sm:flex-row

// Visibility
hidden sm:block lg:hidden
```

## 🎯 **Component Styling Patterns**

### **Cards**
```typescript
// Standard Card
<Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
  {/* Content */}
</Card>

// Gradient Card
<Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-900/20">
  {/* Content */}
</Card>
```

### **Buttons**
```typescript
// Primary Button
<Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">

// Outline Button
<Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">

// Icon Button
<Button size="sm" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
```

### **Form Elements**
```typescript
// Input Fields
<Input 
  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
  placeholder="Enter text..."
/>

// Textarea
<Textarea 
  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
  rows={4}
/>
```

### **Icons**
```typescript
// Standard Icon
<Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />

// Colored Icon
<Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />

// Background Icon
<div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg">
  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
</div>
```

## 🎨 **Layout Patterns**

### **Page Containers**
```typescript
// Main Page Container
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-16 sm:pt-20">
  <div className="container mx-auto px-4 py-8">
    {/* Content */}
  </div>
</div>
```

### **Section Headers**
```typescript
// Section Header
<div className="flex items-center gap-3 mb-4">
  <div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg">
    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
  </div>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Section Title</h2>
</div>
```

### **Grid Layouts**
```typescript
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Grid Items */}
</div>

// Metric Cards Grid
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {/* Metric Cards */}
</div>
```

## 🎭 **Animation & Transitions**

### **Framer Motion Patterns**
```typescript
// Page Transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// Staggered Animations
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.1 }}
>

// Hover Effects
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### **CSS Transitions**
```typescript
// Smooth Transitions
className="transition-all duration-200 hover:shadow-md"

// Color Transitions
className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
```

## 📊 **Status & State Styling**

### **Loading States**
```typescript
// Loading Spinner
<div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>

// Loading Text
<p className="text-gray-600 dark:text-gray-300">Loading...</p>
```

### **Empty States**
```typescript
// Empty State Container
<div className="text-center py-8">
  <Icon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data</h3>
  <p className="text-gray-600 dark:text-gray-300 mb-4">Start by adding some content</p>
  <Button>Get Started</Button>
</div>
```

### **Success/Error States**
```typescript
// Success Message
<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
  <p className="text-green-800 dark:text-green-200">Success message</p>
</div>

// Error Message
<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
  <p className="text-red-800 dark:text-red-200">Error message</p>
</div>
```

## 🎨 **Component-Specific Styling**

### **Weekly Meeting Content**
- **Schedule items**: White cards with delete buttons
- **Calendar events**: Colored badges with time info
- **Section headers**: Icon + title with consistent spacing

### **Dashboard**
- **Metric cards**: Rounded corners with hover effects
- **Weather section**: Gradient background with weather icons
- **Goals section**: Color-coded by timeframe (monthly, overdue, etc.)

### **Vision & Planning**
- **Vision cards**: Gradient backgrounds with accent colors
- **Edit forms**: Clean white backgrounds with proper spacing
- **Read-only displays**: Subtle backgrounds with clear typography

### **Spiritual Growth**
- **Prayer requests**: Card-based layout with status indicators
- **Reading plans**: Collapsible sections with progress tracking
- **Reflection notes**: Textarea with auto-save functionality

## 🔧 **Utility Classes**

### **Spacing**
```typescript
// Padding
p-2, p-4, p-6, p-8
px-4, py-2, pt-4, pb-6

// Margin
m-2, m-4, m-6, m-8
mx-auto, my-4, mt-2, mb-6

// Gap
gap-2, gap-4, gap-6, gap-8
```

### **Typography**
```typescript
// Font Sizes
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

// Font Weights
font-normal, font-medium, font-semibold, font-bold

// Text Colors
text-gray-900, text-gray-700, text-gray-600, text-gray-500
```

### **Borders & Shadows**
```typescript
// Borders
border, border-2, border-gray-200, border-gray-300
rounded, rounded-lg, rounded-full

// Shadows
shadow-sm, shadow-md, shadow-lg
```

## 🎯 **Best Practices**

### **Dark Mode Implementation**
1. **Always provide both light and dark variants**
2. **Use semantic color names** (primary, secondary, etc.)
3. **Test contrast ratios** for accessibility
4. **Use consistent patterns** across components

### **Responsive Design**
1. **Mobile-first approach** with progressive enhancement
2. **Test on multiple screen sizes**
3. **Use relative units** (rem, em) where appropriate
4. **Consider touch targets** for mobile devices

### **Performance**
1. **Minimize CSS bundle size**
2. **Use Tailwind's purge** to remove unused styles
3. **Optimize animations** for smooth performance
4. **Test on slower devices**

### **Accessibility**
1. **Maintain proper contrast ratios**
2. **Use semantic HTML elements**
3. **Provide focus indicators**
4. **Test with screen readers**

## 🚀 **Future Enhancements**

### **Planned Features**
- **Custom color picker** for accent colors
- **Theme presets** (light, dark, auto)
- **Component theming** for advanced customization
- **Animation preferences** (reduce motion support)

### **Accessibility Improvements**
- **High contrast mode** support
- **Font size scaling** options
- **Keyboard navigation** enhancements
- **Screen reader** optimizations

---

This styling guide ensures consistent, accessible, and beautiful design across the entire Marriage Meeting Tool application. All components follow these patterns to maintain a cohesive user experience.
