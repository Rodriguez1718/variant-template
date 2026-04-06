# Design System Audit Report
**Date:** April 6, 2026  
**Auditor:** Senior Frontend Architect  
**Scope:** Component Library & Design System Compliance

---

## Executive Summary

This audit identifies violations of our design system principles across the codebase. Key findings include:
- **Hard-coded CSS variable references** instead of utility classes
- **Magic numbers** in arbitrary Tailwind values
- **Duplicate UI patterns** that should use existing components
- **Inconsistent shadow/hover effects** not defined in global.css
- **Missing opacity variants** in the design system

---

## Critical Issues

### 1. Button Component - Hard-Coded CSS Variables

**File:** `src/components/ui/Button.astro`

**Current Code:**
```astro
const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[#1f2d4d]",
    secondary: "bg-[var(--color-secondary)] text-white hover:bg-[#2f3844]",
    accent: "bg-[var(--color-accent)] text-white hover:bg-[#d97706]",
    outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary)]",
};
```

**Issues:**
- Using `bg-[var(--color-primary)]` instead of utility class `bg-primary`
- Hard-coded hex colors `#1f2d4d`, `#2f3844`, `#d97706` for hover states
- These hover colors are not defined in global.css
- Inconsistent with design system color utilities

**Recommended Refactor:**
```astro
const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    accent: "bg-accent text-white hover:bg-accent-dark",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
};
```

**Required Addition to global.css:**
```css
/* Darker hover variants */
.bg-primary-dark {
  background-color: #1f2d4d;
}

.bg-secondary-dark {
  background-color: #2f3844;
}

.bg-accent-dark {
  background-color: #d97706;
}

.hover\:bg-primary-dark:hover {
  background-color: #1f2d4d;
}

.hover\:bg-secondary-dark:hover {
  background-color: #2f3844;
}

.hover\:bg-accent-dark:hover {
  background-color: #d97706;
}
```

**Reasoning:** All color values must be defined in global.css and accessed via utility classes. This ensures consistency and makes theme changes centralized.

---

### 2. Button Component - Undefined Shadow Effects

**File:** `src/components/ui/Button.astro`

**Current Code:**
```astro
hover:shadow-2xl hover:scale-105
```

**Issues:**
- `shadow-2xl` is a Tailwind default, not defined in our design system
- Hover effects are not standardized in global.css
- Scale transforms should be part of design system

**Recommended Refactor:**

**Add to global.css:**
```css
/* Button Hover Effects */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

**Updated Button Code:**
```astro
const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark hover-lift",
    secondary: "bg-secondary text-white hover:bg-secondary-dark hover-lift",
    accent: "bg-accent text-white hover:bg-accent-dark hover-lift",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover-lift",
};
```

**Reasoning:** Standardize all interactive effects in the design system for consistency across components.

---

### 3. About Component - Magic Numbers

**File:** `src/components/layout/About.astro`

**Current Code:**
```astro
<div class="relative w-[360px]">
<div class="absolute top-0 right-[5px] w-60">
<div class="absolute bottom-0 right-[5px] bg-white shadow-xl p-6 w-60 h-[230px]">
```

**Issues:**
- `w-[360px]` - arbitrary width value
- `right-[5px]` - magic number spacing
- `h-[230px]` - arbitrary height value
- `h-[350px]` - arbitrary height value
- Not using Tailwind's spacing scale

**Recommended Refactor:**
```astro
<div class="relative w-90">  <!-- 360px = 90 * 4px -->
<div class="absolute top-0 right-1 w-60">  <!-- 5px ≈ 4px (right-1) -->
<div class="absolute bottom-0 right-1 bg-white shadow-xl p-6 w-60 h-58">  <!-- 230px ≈ 232px (h-58) -->
```

**Alternative - Add to global.css if these are design system values:**
```css
/* Component-specific dimensions */
.w-image-primary {
  width: 360px;
}

.h-stats-card {
  height: 230px;
}

.h-image-secondary {
  height: 350px;
}
```

**Reasoning:** Either use Tailwind's spacing scale or define custom values in global.css. Arbitrary values make the design system unpredictable.

---

### 4. About Component - Inline Styles & Hard-coded Effects

**File:** `src/components/layout/About.astro`

**Current Code:**
```astro
<style>
  button:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
</style>
```

**Issues:**
- Inline styles override design system
- Shadow effect not defined in global.css
- Inconsistent with other button hover effects

**Recommended Refactor:**
Remove inline styles entirely. Use the `hover-lift` class from global.css (see Issue #2).

**Reasoning:** All styling must come from global.css or Tailwind utilities. Inline styles break the design system.

---

### 5. About Component - Duplicate Rounded Circle Pattern

**File:** `src/components/layout/About.astro`

**Current Code:**
```astro
<div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">
```

**Issues:**
- This icon container pattern appears in multiple files
- Should be extracted to a reusable component
- `flex-shrink-0` should be `shrink-0` (modern Tailwind)

**Recommended Refactor:**

**Create new component:** `src/components/ui/IconCircle.astro`
```astro
---
interface Props {
    variant?: "accent" | "primary" | "secondary";
    size?: "sm" | "md" | "lg";
}

const { variant = "accent", size = "md" } = Astro.props;

const variants = {
    accent: "bg-accent",
    primary: "bg-primary",
    secondary: "bg-secondary",
};

const sizes = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
};
---

<div class={`${sizes[size]} rounded-full flex items-center justify-center shrink-0 ${variants[variant]}`}>
    <slot />
</div>
```

**Usage:**
```astro
<IconCircle variant="accent" size="md">
    <svg class="w-6 h-6 text-white" ...>...</svg>
</IconCircle>
```

**Reasoning:** DRY principle - this pattern appears 6+ times across components. Extract to reusable component.

---

### 6. Trades-We-Serve Page - Duplicate Feature Card Pattern

**File:** `src/pages/trades-we-serve.astro`

**Current Code:**
```astro
<div class="flex items-start gap-4">
    <div class="w-16 h-16 bg-accent shrink-0 flex items-center justify-center">
        <svg class="w-8 h-8 text-white" ...>...</svg>
    </div>
    <div>
        <h3 class="font-heading font-bold text-xl text-primary mb-3">
            Industry Language That Converts
        </h3>
        <p class="text-base text-gray-600 leading-relaxed">...</p>
    </div>
</div>
```

**Issues:**
- This exact pattern repeats 4 times on the same page
- Icon container should use IconCircle component
- Should be extracted to FeatureCard component

**Recommended Refactor:**

**Create:** `src/components/ui/FeatureCard.astro`
```astro
---
import IconCircle from "./IconCircle.astro";

interface Props {
    title: string;
    description: string;
    iconPath: string;
}

const { title, description, iconPath } = Astro.props;
---

<div class="flex items-start gap-4">
    <IconCircle variant="accent" size="lg">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath}></path>
        </svg>
    </IconCircle>
    <div>
        <h3 class="font-heading font-bold text-xl text-primary mb-3">
            {title}
        </h3>
        <p class="text-base text-gray-600 leading-relaxed">
            {description}
        </p>
    </div>
</div>
```

**Usage:**
```astro
<FeatureCard
    title="Industry Language That Converts"
    description="Content written in the exact terminology..."
    iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
/>
```

**Reasoning:** Eliminates 4 instances of duplicate markup. Makes the page more maintainable.

---

### 7. TemplateGrid Component - Hard-coded Button Styles

**File:** `src/components/layout/TemplateGrid.astro`

**Current Code:**
```astro
<a href="/our-work" class="inline-block px-6 py-3 border-2 border-primary text-primary font-heading font-bold uppercase hover:bg-primary hover:text-white transition-colors">
    Browse All Works
</a>

<a href="/our-work" class="inline-block px-6 py-3 bg-accent text-white font-heading font-bold uppercase hover:bg-accent/90 transition-colors">
    View All Templates
</a>
```

**Issues:**
- Duplicating Button component styles
- Not using the Button component
- Inconsistent with design system

**Recommended Refactor:**
```astro
import Button from "../ui/Button.astro";

<Button variant="outline" size="md" href="/our-work">
    Browse All Works
</Button>

<Button variant="accent" size="md" href="/our-work">
    View All Templates
</Button>
```

**Reasoning:** Always use the Button component. Never recreate button styles inline.

---

### 8. Missing Opacity Variants in Design System

**Files:** Multiple components use `bg-accent/90`, `bg-primary/90`, `bg-primary/95`

**Current Usage:**
```astro
hover:bg-accent/90
bg-gradient-to-b from-primary/90 to-primary/95
```

**Issues:**
- `/90` and `/95` opacity variants not defined in global.css
- Only `/10`, `/20`, `/30`, `/50` are defined
- Inconsistent opacity scale

**Recommended Addition to global.css:**
```css
/* Additional Opacity Variants */
.bg-primary\/90 {
  background-color: rgba(48, 70, 120, 0.9);
}

.bg-primary\/95 {
  background-color: rgba(48, 70, 120, 0.95);
}

.bg-accent\/90 {
  background-color: rgba(245, 159, 10, 0.9);
}

.hover\:bg-accent\/90:hover {
  background-color: rgba(245, 159, 10, 0.9);
}

/* Gradient utilities with opacity */
.from-primary\/90 {
  --tw-gradient-from: rgba(48, 70, 120, 0.9);
}

.to-primary\/95 {
  --tw-gradient-to: rgba(48, 70, 120, 0.95);
}
```

**Reasoning:** Complete the opacity scale for all brand colors. Ensures consistency.

---

### 9. ServiceFeatures Component - Inconsistent Typography

**File:** `src/components/layout/ServiceFeatures.astro`

**Current Code:**
```astro
<p class="text-xl text-gray-600 max-w-3xl mx-auto">
    {tradeDescription}
</p>
```

**Issues:**
- Using `text-xl` instead of `text-subtitle` for subtitle text
- Inconsistent with design system typography hierarchy

**Recommended Refactor:**
```astro
<p class="text-subtitle text-gray-600 max-w-3xl mx-auto">
    {tradeDescription}
</p>
```

**Reasoning:** Always use semantic typography classes (`heading-h1`, `heading-h2`, `text-subtitle`) instead of raw size classes.

---

### 10. About Component - Duplicate Stats Card

**File:** `src/components/layout/About.astro`

**Current Code:**
Two identical stats cards - one for desktop (hidden on mobile), one for mobile (hidden on desktop).

**Issues:**
- Duplicate markup violates DRY
- Harder to maintain
- Increases bundle size

**Recommended Refactor:**

**Create:** `src/components/ui/StatsCard.astro`
```astro
---
interface Props {
    value: string;
    label: string;
    animated?: boolean;
}

const { value, label, animated = true } = Astro.props;
---

<div class="bg-white shadow-xl p-6 w-60">
    <div class="flex justify-between items-start mb-3">
        <h3 class="text-xl font-heading font-bold text-primary">Proven Results</h3>
        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    </div>
    
    <div class="w-full h-px mb-3 bg-primary opacity-20"></div>
    
    <div class="text-center mt-6">
        <div class="text-4xl font-heading font-bold mb-1 text-primary">
            {animated ? (
                <span class="counter" data-target={value}>0</span>
            ) : (
                <span>{value}</span>
            )}+
        </div>
        <p class="text-base text-gray-600">{label}</p>
    </div>
</div>
```

**Usage:**
```astro
<!-- Desktop -->
<div class="absolute bottom-0 right-1 hidden sm:block">
    <StatsCard value="500" label="Contractors Served" />
</div>

<!-- Mobile -->
<div class="sm:hidden">
    <StatsCard value="500" label="Contractors Served" />
</div>
```

**Reasoning:** Single source of truth for stats card. Easier to update and maintain.

---

## Summary of Required Actions

### Immediate (Critical)
1. ✅ Update Button component to use utility classes instead of CSS variables
2. ✅ Add missing color variants to global.css (primary-dark, secondary-dark, accent-dark)
3. ✅ Add missing opacity variants (/90, /95) to global.css
4. ✅ Standardize hover effects in global.css

### High Priority
5. ✅ Create IconCircle component
6. ✅ Create FeatureCard component
7. ✅ Create StatsCard component
8. ✅ Replace all hard-coded buttons with Button component
9. ✅ Fix magic numbers in About component

### Medium Priority
10. ✅ Update all components to use text-subtitle instead of text-xl for subtitles
11. ✅ Remove all inline <style> blocks
12. ✅ Audit and replace flex-shrink-0 with shrink-0

---

## Design System Compliance Checklist

- [ ] All colors use utility classes from global.css
- [ ] No hard-coded hex values in components
- [ ] No arbitrary Tailwind values (w-[360px])
- [ ] All interactive effects defined in global.css
- [ ] No duplicate UI patterns
- [ ] All buttons use Button component
- [ ] Typography uses semantic classes (heading-h1, text-subtitle)
- [ ] No inline <style> blocks
- [ ] All opacity variants defined in global.css

---

**Next Steps:** Implement the recommended refactors in priority order. After each change, run visual regression tests to ensure consistency.
