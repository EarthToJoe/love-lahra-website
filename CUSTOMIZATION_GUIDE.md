# Lahra's Life - Customization Guide

This guide explains how to easily customize the website's appearance, themes, and content to match changing vibes and preferences.

## 🎨 Theme System

### Quick Theme Changes

The website uses a comprehensive theme system that allows for easy visual transformations:

**Location**: `src/lib/theme.ts`

### Available Themes

1. **Sophisticated** (Current)
   - Navy, champagne gold, crisp white
   - New York elegance meets coastal sophistication
   - Perfect for: Professional, elegant, timeless vibes

2. **Minimalist Blush**
   - Soft blush tones with clean lines
   - Understated elegance
   - Perfect for: Soft, romantic, minimal vibes

3. **Bold & Dramatic**
   - Deep blacks with gold accents
   - High contrast sophistication
   - Perfect for: Dramatic, bold, statement vibes

### Creating New Themes

To create a new theme, add a new `ThemeConfig` object in `src/lib/theme.ts`:

```typescript
export const myNewTheme: ThemeConfig = {
  name: "My New Vibe",
  description: "Description of the vibe",
  colors: {
    primary: { /* color palette */ },
    accent: { /* color palette */ },
    neutral: { /* color palette */ }
  },
  typography: { /* font settings */ },
  spacing: { /* spacing values */ },
  // ... other settings
}
```

### Switching Themes

1. **Via Theme Switcher**: Click the theme button in the bottom-left corner
2. **Programmatically**: Update `currentTheme` in `src/lib/theme.ts`
3. **For Development**: Change the `initialTheme` prop in `src/app/layout.tsx`

## 🎯 Content Customization

### Homepage Sections

**Location**: `src/app/page.tsx`

The content sections are easily customizable:

```typescript
const contentSections = [
  {
    title: "Section Title",
    description: "Section description",
    href: "/section-url",
    icon: "🎨" // Emoji or icon
  },
  // Add more sections...
]
```

### Navigation Menu

**Location**: `src/components/layout/navigation.tsx`

Update the navigation items:

```typescript
const navigationItems = [
  { name: 'Menu Item', href: '/path' },
  // Add more items...
]
```

### Footer Links

**Location**: `src/components/layout/footer.tsx`

Modify footer link categories:

```typescript
const footerLinks = {
  'Category Name': [
    { name: 'Link Name', href: '/path' },
    // Add more links...
  ],
  // Add more categories...
}
```

## 🎭 Visual Customization

### Colors

All colors are defined in the theme system. To change colors:

1. **Individual Colors**: Modify specific color values in theme objects
2. **Color Schemes**: Create new theme variants
3. **Accent Colors**: Update accent color palettes for different moods

### Typography

**Font Changes**:
- Update `fontFamily` in theme configuration
- Add new Google Fonts in `src/app/layout.tsx`
- Modify font sizes in theme `fontSize` settings

### Spacing & Layout

**Spacing**: Adjust `spacing` values in theme configuration
**Shadows**: Modify `shadows` in theme for different depth effects
**Border Radius**: Change `borderRadius` for different corner styles

## 🎪 Animation Customization

### Animation Settings

**Location**: Theme configuration `animations` section

```typescript
animations: {
  duration: {
    fast: '150ms',    // Quick interactions
    normal: '300ms',  // Standard animations
    slow: '500ms',    // Dramatic effects
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    sharp: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }
}
```

### Custom Animations

**Location**: `src/components/ui/animations.tsx`

Add new animation components or modify existing ones:

```typescript
export const MyCustomAnimation = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ /* initial state */ }}
      animate={{ /* animated state */ }}
      transition={{ /* transition settings */ }}
    >
      {children}
    </motion.div>
  )
}
```

## 🎨 Component Customization

### Card Variants

**Location**: `src/components/ui/card.tsx`

Add new card styles:

```typescript
const variantClasses = {
  default: 'bg-white border border-neutral-200',
  elevated: 'bg-white shadow-elegant',
  luxury: 'bg-white shadow-luxury border border-neutral-100',
  minimal: 'bg-neutral-50 border border-neutral-100',
  myNewVariant: 'custom-classes-here', // Add new variant
}
```

### Button Styles

**Location**: `src/components/ui/button.tsx`

Customize button appearances by adding new variants or modifying existing ones.

## 🎪 Seasonal/Event Customization

### Quick Seasonal Changes

1. **Create Seasonal Themes**: Add themes for holidays, seasons, or special events
2. **Temporary Overrides**: Use CSS custom properties for quick changes
3. **Content Updates**: Modify homepage content for special occasions

### Example: Holiday Theme

```typescript
export const holidayTheme: ThemeConfig = {
  name: "Holiday Sparkle",
  description: "Festive colors for special occasions",
  colors: {
    primary: { /* holiday colors */ },
    accent: { /* sparkly accents */ },
    // ...
  }
}
```

## 🎯 Advanced Customization

### CSS Custom Properties

For real-time theme switching, the system can be extended to use CSS custom properties:

```css
:root {
  --color-primary: theme('colors.primary.500');
  --color-accent: theme('colors.accent.500');
}
```

### Dynamic Theme Loading

Implement dynamic theme loading from:
- User preferences
- Admin panel settings
- API endpoints
- Local storage

### Responsive Customization

Themes can include responsive settings:

```typescript
responsive: {
  mobile: { /* mobile-specific overrides */ },
  tablet: { /* tablet-specific overrides */ },
  desktop: { /* desktop-specific overrides */ }
}
```

## 🎨 Best Practices

1. **Test Themes**: Always test new themes across different pages
2. **Accessibility**: Ensure color contrast meets accessibility standards
3. **Performance**: Keep theme switching smooth and fast
4. **Consistency**: Maintain consistent spacing and typography scales
5. **Documentation**: Document custom themes and their intended use cases

## 🎪 Quick Customization Checklist

- [ ] Choose or create theme that matches current vibe
- [ ] Update homepage content sections if needed
- [ ] Modify navigation menu for new sections
- [ ] Adjust footer links and information
- [ ] Test theme across all pages
- [ ] Verify mobile responsiveness
- [ ] Check accessibility compliance
- [ ] Document changes for future reference

## 🎭 Future Enhancements

The customization system is designed to support:
- Admin panel for theme management
- User-specific theme preferences
- Seasonal automatic theme switching
- A/B testing different themes
- Integration with brand guidelines
- Real-time theme preview

---

This system makes it incredibly easy to transform the entire look and feel of the website whenever the vibe changes, ensuring Lahra's Life always feels fresh and aligned with current preferences!