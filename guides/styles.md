# Developer Styling Guide

This guide provides an overview of the standardized styles for our website and explains how to use them in your component CSS modules. It covers the available variables for fonts, colors, and breakpoints, and demonstrates how to apply them effectively to ensure consistency and responsiveness throughout the project.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Available Variables](#available-variables)
   - [Colors](#colors)
   - [Fonts](#fonts)
   - [Breakpoints](#breakpoints)
3. [Using Variables in CSS Modules](#using-variables-in-css-modules)
   - [Applying Colors](#applying-colors)
   - [Applying Fonts](#applying-fonts)
   - [Responsive Design with Breakpoints](#responsive-design-with-breakpoints)
4. [Typography Guidelines](#typography-guidelines)
   - [Headers](#headers)
   - [Body Text](#body-text)
   - [Links](#links)
5. [Mobile-First Design](#mobile-first-design)
   - [Understanding Mobile-First](#understanding-mobile-first)
   - [Implementing Mobile-First CSS](#implementing-mobile-first-css)
6. [Best Practices](#best-practices)
   - [Mobile Responsiveness](#mobile-responsiveness)
   - [Accessibility](#accessibility)
   - [Consistency](#consistency)
7. [Additional Notes](#additional-notes)
   - [Importing `globals.css`](#importing-globalscss)

---

## Introduction

To maintain a cohesive and professional appearance across our website, we've established a set of standardized styles defined in the `globals.css` file. As a developer, you have access to a range of CSS variables for colors, fonts, and breakpoints. This document explains how to use these variables in your component CSS modules to ensure consistency and facilitate responsive design.

---

## Available Variables

All CSS variables are defined in the `:root` selector within `globals.css` and are globally accessible throughout the project.

### Colors

- **Primary Background Color**: `var(--primary-background)`

  - **Value**: `#FFFEFA` (Off-White)
  - **Usage**: Background color for pages and large containers.

- **Secondary Color (Foreground)**: `var(--secondary-color)`

  - **Value**: `#0D0B00` (Very Dark Brown)
  - **Usage**: Primary color for text and important elements.

- **Foreground Color**: `var(--foreground)`
  - **Alias** for `--secondary-color` to enhance code readability.

**Dark Mode Support**:

- In dark mode, colors adjust automatically based on the user's system preference.
  - **Dark Mode Background**: `#0a0a0a`
  - **Dark Mode Foreground**: `#ededed`

### Fonts

- **Header Font**: `var(--header-font)`

  - **Fonts**: `'Empira Light', 'Libre Franklin', sans-serif`
  - **Usage**: For all headings (`<h1>` to `<h6>`).

- **Text Font**: `var(--text-font)`
  - **Fonts**: `'Geller', 'Crimson Text', serif`
  - **Usage**: For body text, paragraphs, links, list items, etc.

### Breakpoints

Use these variables for responsive design:

- **Extra Small Devices**: `--breakpoint-xs` (`480px`)
- **Small Devices**: `--breakpoint-sm` (`768px`)
- **Medium Devices**: `--breakpoint-md` (`1024px`)
- **Large Devices**: `--breakpoint-lg` (`1280px`)

---

## Using Variables in CSS Modules

When styling components, you can access the global CSS variables directly within your CSS module files. There's **no need to import `globals.css`** in your components, as the variables are defined in the global scope and are inherently accessible.

### Applying Colors

**Example**: Styling a button with background and text colors.

```css
/* Button.module.css */

.button {
  background-color: var(--secondary-color);
  color: var(--primary-background);
  border: none;
  padding: 1rem 2rem;
  cursor: pointer;
}
```

### Applying Fonts

**Example**: Styling a heading and paragraph with the standardized fonts.

```css
/* Component.module.css */

.heading {
  font-family: var(--header-font);
  font-size: 2rem;
}

.paragraph {
  font-family: var(--text-font);
  font-size: 1rem;
  line-height: 1.5;
}
```

### Responsive Design with Breakpoints

Use the breakpoint variables to create media queries that adjust styles based on screen size.

**Example**: Making a container responsive.

```css
/* Container.module.css */

.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: var(--breakpoint-sm)) {
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (min-width: var(--breakpoint-md)) {
  .container {
    max-width: 900px;
  }
}
```

**Example**: Adjusting font sizes for different devices.

```css
/* Text.module.css */

.text {
  font-size: 1rem;
}

@media (min-width: var(--breakpoint-sm)) {
  .text {
    font-size: 1.1rem;
  }
}

@media (min-width: var(--breakpoint-md)) {
  .text {
    font-size: 1.2rem;
  }
}
```

---

## Typography Guidelines

Consistent typography enhances readability and user experience. Use the following guidelines when styling text elements.

### Headers

- **Font Family**: Use `var(--header-font)` for all headings.
- **Usage Example**:

```css
/* Headers.module.css */

.heading-1 {
  font-family: var(--header-font);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.heading-2 {
  font-family: var(--header-font);
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}
```

### Body Text

- **Font Family**: Use `var(--text-font)` for paragraphs and general text.
- **Line Height**: Use `1.5` for comfortable reading.
- **Usage Example**:

```css
/* Text.module.css */

.paragraph {
  font-family: var(--text-font);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}
```

### Links

- **Color**: Use `var(--foreground)` for link text.
- **Text Decoration**:
  - **Default**: None.
  - **On Hover/Focus**: Underline.
- **Usage Example**:

```css
/* Links.module.css */

.link {
  color: var(--foreground);
  text-decoration: none;
}

.link:hover,
.link:focus {
  text-decoration: underline;
}
```

---

## Mobile-First Design

### Understanding Mobile-First

Mobile-first design is an approach where you start designing and developing for mobile devices (small screens) before scaling up to larger screens. This ensures that the core user experience is optimized for mobile users, who often represent a significant portion of website traffic.

**Key Principles**:

- **Performance Optimization**: Mobile devices may have slower network speeds and less processing power.
- **Content Prioritization**: Essential content is presented clearly on small screens.
- **Progressive Enhancement**: Additional features and styles are added for larger screens.

### Implementing Mobile-First CSS

In your CSS, write styles targeting the smallest screens first (default styles) and then use `min-width` media queries to apply styles for larger screens.

**Example**: Mobile-first styling of a component.

```css
/* Component.module.css */

/* Default styles for mobile devices */
.card {
  padding: 1rem;
  background-color: var(--primary-background);
}

/* Larger screens */
@media (min-width: var(--breakpoint-sm)) {
  .card {
    padding: 1.5rem;
  }
}

@media (min-width: var(--breakpoint-md)) {
  .card {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
}
```

**Guidelines**:

- **Start with Base Styles**: Define the default styles that apply to all devices, typically optimized for mobile.
- **Use `min-width` Media Queries**: Apply additional styles for larger screens.
- **Avoid Overriding Styles**: By building up styles progressively, you minimize the need to override previous declarations.

---

## Best Practices

### Mobile Responsiveness

- **Embrace Mobile-First**: Start your CSS with mobile styles and add enhancements for larger screens using `min-width` media queries.
- **Flexible Units**: Use relative units like `rem` and `%` instead of fixed units like `px`.
- **Responsive Media**: Make images and videos fluid within their containers.

**Example**:

```css
/* Image.module.css */

.image {
  width: 100%;
  height: auto;
  display: block;
}
```

### Accessibility

- **Contrast Ratios**: Ensure sufficient contrast between text and background colors.
- **Focus Styles**: Maintain visible focus indicators for interactive elements.
- **Semantic HTML**: Use appropriate HTML elements for content structure.

**Example**:

```css
/* Accessibility.module.css */

.button:focus {
  outline: 2px solid var(--foreground);
  outline-offset: 2px;
}
```

### Consistency

- **Use Variables**: Always use the defined CSS variables for colors, fonts, and breakpoints.
- **Avoid Overrides**: Do not use hardcoded values that conflict with global styles.
- **Component Isolation**: Keep styles scoped within your component CSS modules to prevent unintended side effects.

---

## Additional Notes

### Importing `globals.css`

**No Import Necessary**:

- **Do Not Import `globals.css`** in your component CSS modules.
- The variables defined in `globals.css` are globally scoped and inherently accessible throughout the application.
- Importing `globals.css` into your components is unnecessary and may lead to redundancy.

**Usage**:

- Access the variables directly in your CSS modules as demonstrated in the examples above.

---

By following this guide, you will contribute to a consistent, responsive, and accessible user experience across our website. Should you have any questions or need further clarification, please reach out to the project lead.

Thank you for your dedication and attention to detail!
