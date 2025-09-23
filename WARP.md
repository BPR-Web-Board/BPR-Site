# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the Brown Political Review (BPR) website built as a Next.js 15 application that fetches content from a WordPress site using the WordPress REST API. The site displays political articles with a component-based architecture focused on responsive design and performance.

## Common Development Commands

### Development
```bash
# Start development server with Turbopack (Next.js 15 optimization)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

### Code Quality
```bash
# Lint code using ESLint (Next.js config)
npm run lint
```

## Architecture Overview

### WordPress Integration
- **Data Source**: WordPress REST API at `brownpoliticalreview.org`
- **API Layer**: `src/app/lib/wordpress.ts` - Complete WordPress REST API wrapper
- **Types**: `src/app/lib/types.d.ts` - TypeScript definitions for WordPress entities
- **Post Enhancement**: `src/app/lib/enhancePost.ts` - Enriches posts with featured media, author data, and categories

### Component Architecture
- **Component Structure**: Each component lives in `src/app/components/[ComponentName]/`
  - `ComponentName.tsx` - React component
  - `ComponentName.css` - Component-specific styles  
  - `index.ts` - Export file
- **Key Components**:
  - `Hero` - Featured article hero section with background image
  - `ArticleGrid`, `FourArticleGrid` - Article grid layouts
  - `ArticlePreviewGrid` - Compact article preview grid
  - `TwoColumnArticleLayout` - Two-column article display
  - `NavigationBar`, `Footer` - Site navigation

### Styling System
- **CSS Variables**: Global design system defined in `src/app/globals.css`
  - Colors: `--color-white`, `--color-black`, `--color-red`, etc.
  - Typography: `--font-primary-serif` (Nicholas), `--font-primary-sans` (FranklinGothic URW), `--font-primary-text` (FreightText Pro)
  - Spacing: `--space-1` through `--space-7` (8pt grid system)
  - Breakpoints: `--breakpoint-sm` (768px), `--breakpoint-md` (1024px), `--breakpoint-lg` (1280px)
- **Mobile-First**: All styling starts with mobile and scales up using `min-width` media queries
- **Component Styles**: Use CSS Modules for component-specific styling

### Data Flow
1. WordPress API functions fetch raw data
2. `enhancePost()` enriches posts with:
   - Featured media objects
   - Author information
   - Category objects
3. Components receive `EnhancedPost` objects with all necessary data

## Required Environment Variables

Create `.env.local` file:
```bash
WORDPRESS_URL="https://brownpoliticalreview.org"
WORDPRESS_HOSTNAME="brownpoliticalreview.org"
```

## Key Utilities

### WordPress API Functions
Located in `src/app/lib/wordpress.ts`:
- `getAllPosts(filterParams?)` - Fetch posts with optional filters
- `getPostsByCategorySlug(slug, perPage?)` - Get posts by category
- `enhancePosts(posts, categories)` - Enrich posts with metadata
- Full API documented in `guides/wordpressAPI.md`

### Style Utilities
Located in `src/app/lib/utils.ts`:
- `formatDate(dateString)` - Format dates for display
- `stripHtml(html)` - Remove HTML tags
- `getArticleTitle(post)` - Extract title from post object
- `getArticleLink(post)` - Generate article URLs

## Testing Strategy

- **Mocked Tests**: WordPress API functions tested with `axios-mock-adapter`
- **Integration Tests**: Available for testing against real WordPress site
- **Test Location**: `tests/` directory
- **Coverage**: Comprehensive WordPress API function coverage

## Development Guidelines

### Component Development
- Use TypeScript for all components
- Import `EnhancedPost` type from `src/app/lib/types.d.ts`
- Follow mobile-first responsive design principles
- Use CSS variables from `globals.css` for consistency

### WordPress Data Handling
- Always use `enhancePost()` or `enhancePosts()` before passing data to components
- Handle missing data gracefully (featured images, author info, etc.)
- Use utility functions for consistent data extraction

### Styling Best Practices
- Start with mobile styles, enhance for larger screens
- Use CSS variables for colors, fonts, and spacing
- Follow 8pt grid system for spacing
- Component styles should be scoped using CSS Modules

## Custom Configuration

- **Next.js Config**: Allows images from `brownpoliticalreview.org` and `api.builder.io`
- **TypeScript**: Strict mode enabled with path mapping (`@/*` → `./src/*`)
- **PostCSS**: Configured for Tailwind CSS integration
- **Builder.io**: Development server configured at `localhost:3000`

## Font System

The site uses a custom font hierarchy:
- **Headers**: Nicholas (primary), Playfair Display (fallback)
- **Navigation**: FranklinGothic URW (primary), Libre Franklin (fallback)  
- **Body Text**: FreightText Pro (primary), Crimson Text (fallback)

Custom fonts are loaded via `@font-face` declarations in `globals.css` and Adobe Fonts integration.