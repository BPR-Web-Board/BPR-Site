/**
 * Custom image loader with timeout and error handling
 * Used by Next.js Image component to optimize external images
 */

import { ImageLoaderProps } from "next/image";

// Default placeholder image (1x1 gray pixel base64)
export const DEFAULT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23666'%3EImage Loading...%3C/text%3E%3C/svg%3E";

export const DEFAULT_ERROR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3EImage Unavailable%3C/text%3E%3C/svg%3E";

/**
 * Custom loader for Next.js Image component
 * Bypasses Next.js image optimization for external URLs to avoid timeout issues
 */
export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If it's already a data URL or blob, return as-is
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  // For external WordPress images, return the original URL
  // This bypasses Next.js optimization which is causing timeout issues
  if (src.includes("brownpoliticalreview.org")) {
    return src;
  }

  // For other images, use default Next.js optimization
  const params = new URLSearchParams();
  params.set("url", src);
  params.set("w", width.toString());
  params.set("q", (quality || 75).toString());

  return `/_next/image?${params.toString()}`;
}
