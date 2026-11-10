# Developer Styling Guide

Overview of the design tokens in `src/app/globals.css` and how to use them in component CSS. Prefer these variables over hardcoded colors, fonts, and spacing.

---

## Table of Contents

1. [Source of truth](#source-of-truth)
2. [Themes](#themes)
3. [Colors](#colors)
4. [Fonts & type scale](#fonts--type-scale)
5. [Spacing](#spacing)
6. [Layout & articles](#layout--articles)
7. [Breakpoints](#breakpoints)
8. [Component patterns](#component-patterns)
9. [Best practices](#best-practices)

---

## Source of truth

All shared tokens live on `:root` in `globals.css`. Component CSS (for example `FourArticleGrid.css`) can use them directly — do **not** import `globals.css` into each file.

Fonts:

- Adobe Fonts (Nicholas, FranklinGothic URW) via Typekit in `layout.tsx`
- Next.js fallbacks: Playfair Display + Libre Franklin (`--font-playfair`, `--font-libre-franklin`)

---

## Themes

Theme is set on `<html data-theme="…">` (not `prefers-color-scheme` alone):

| Value | When |
|--------|------|
| `light` | Default / user preference |
| `dark` | User preference |
| `issue` | Magazine issue pages (`.issue-edition`) with a custom WordPress palette |

Issue palettes are **not** hard-coded in `globals.css`. WordPress issue metadata supplies background/text colors; `getIssueThemeCss()` injects overrides under `:root[data-theme="issue"]` (see `guides/wordpressAPI.md` → Magazine issues).

---

## Colors

### Core surfaces & text

| Token | Light role |
|--------|------------|
| `--surface` | Page / card background (`#fffefa` paper) |
| `--foreground` | Primary ink (`#0d0b00`) |
| `--text-primary` | Alias of foreground for titles |
| `--text-secondary` | Supporting text |
| `--text-muted` | Metadata / quiet UI |
| `--surface-muted` | Subtle fills / placeholders |
| `--surface-hover` | Hover wash |
| `--surface-skeleton` | Loading skeletons |
| `--color-danger` | Errors |
| `--color-interactive` | Brand interactive (BPR red) |
| `--divider-color` / `--color-border` | Rules and outlines |

Also available: `--color-red`, `--color-orange`, `--color-yellow`, `--color-green`, `--color-blue`.

Dark theme remaps the surface/text tokens under `:root[data-theme="dark"]`.

**Usage:**

```css
.panel {
  background: var(--surface);
  color: var(--text-primary);
  border-top: var(--divider-border);
}

.meta {
  color: var(--text-muted);
  font-size: var(--font-size-metadata);
}
```

---

## Fonts & type scale

| Token | Stack |
|--------|--------|
| `--font-primary-serif` | Nicholas → Playfair → serif (display / titles) |
| `--font-primary-sans` | FranklinGothic URW → Libre Franklin → sans |
| `--font-primary-text` | Nicholas stack (long-form serif) |
| `--font-body` | Same as primary sans |

Utility classes: `.font-serif`, `.font-sans`, `.font-text`.

### Article / UI sizes

| Token | Typical use |
|--------|-------------|
| `--font-size-metadata` | Bylines, badges, pills |
| `--font-size-preview` | Card excerpts |
| `--font-size-compact-title` | Side / compact cards |
| `--font-size-card-title` | Grid cards |
| `--font-size-featured-title` | Featured / layout center |
| `--font-size-section-title` | Section headings |
| `--font-size-hero-title` | Hero |
| `--font-size-article-title` | Article page |
| `--font-size-article-body` | Article body |

Legacy 8pt steps still exist: `--font-size-xs` … `--font-size-xxl`. Prefer the named article tokens for cards and sections.

Line heights: `--line-height-sm` (120%), `--line-height-md` (130%), `--line-height-lg` (140%).

---

## Spacing

8pt-based scale:

| Token | Value |
|--------|--------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 16px |
| `--space-4` | 24px |
| `--space-5` | 32px |
| `--space-6` | 48px |
| `--space-7` | 64px |

Section rhythm: `--section-gap`, `--section-heading-gap`, `--section-with-heading-gap`.

Helper classes: `.mt-1`…`.mt-7`, `.mb-1`…`.mb-7`, `.pt-1`…`.pt-7`, `.pb-1`…`.pb-7`.

---

## Layout & articles

| Token | Meaning |
|--------|---------|
| `--site-gutter` | Side inset (48px) |
| `--content-width` | `calc(100% - gutter * 2)` |
| `--article-card-gap` | Gap between cards (13px) |
| `--article-card-inset` | Padding inside card frames |
| `--article-content-gap` | Gap inside a card stack |
| `--article-image-ratio` | Default image ratio **4 / 3** |
| `--article-wide-image-ratio` | Shorter images **16 / 9** (grids, featured layouts, side stacks) |
| `--article-side-image-width` | Horizontal card image width (~35%) |
| `--article-compact-image-width` | Compact horizontal (~30%) |

**When to use which ratio**

- `--article-wide-image-ratio` — FourArticleGrid tops, ArticleLayout featured, feature-side cards, TwoColumn tops
- `--article-image-ratio` — Default cards / previews that should stay taller

Feature-balanced side columns keep cards **content-sized** (they no longer stretch to the featured height).

---

## Breakpoints

Documented as CSS variables (for reference in docs/JS). In stylesheets, use literal `min-width` / `max-width` values — media queries cannot reliably use `var()` in all browsers.

| Token | Width |
|--------|--------|
| `--breakpoint-sm` | 768px |
| `--breakpoint-md` | 1024px |
| `--breakpoint-lg` | 1280px |

Common pattern in this repo: mobile base styles, then `@media (min-width: 768px)` / `1024px`.

---

## Component patterns

### Section heading rule

`.section-heading-rule` draws a full-bleed top rule using `--divider-border` and `--site-gutter`.

### Article card frame

`.article-card-frame` — inset padding, outline border, hover wash via `color-mix` on `--foreground` / `--surface`. Stretch link: `.article-card-stretch-link`.

### Media badges

`ArticleMedia` overlays `.article-media-badge` for Audio / Video / Photos / Data. Placeholders are icon-only when the badge is present so labels are not duplicated.

### Navigation z-index

`--z-navigation`, `--nav-expanded-height`, `--nav-collapsed-height`, `--shadow-navigation`.

---

## Best practices

1. Use tokens (`--surface`, `--text-*`, `--space-*`, image ratios) instead of raw hex/px when a token exists.
2. Prefer `--article-wide-image-ratio` for homepage / section grids that should feel shorter.
3. Theme-aware UI: depend on `--surface` / `--foreground`, not hard-coded light-only colors.
4. Issue pages: let injected issue CSS + `data-theme="issue"` drive palette; don’t fork magazine colors in component CSS.
5. Keep component CSS scoped by class; avoid importing `globals.css` into modules.

---

Questions about tokens or magazine theming: check `globals.css`, `src/app/lib/issues.ts`, and `guides/wordpressAPI.md`.
