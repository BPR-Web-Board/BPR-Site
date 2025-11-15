"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import {
  DEFAULT_PLACEHOLDER,
  DEFAULT_ERROR_PLACEHOLDER,
} from "../../../../lib/loaders/imageLoader";

export interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  placeholderClassName?: string;
}

/**
 * OptimizedImage component with error handling and loading states
 * Handles timeout errors gracefully by showing fallback or placeholder
 * Always renders an image - either the actual image, loading state, or error state
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  showPlaceholder = true,
  placeholderClassName = "image-placeholder",
  className = "",
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.warn(`Image failed to load: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Determine which image source to use
  let imageSrc = src;

  if (imageError) {
    // Use fallback if provided, otherwise use error placeholder
    imageSrc = fallbackSrc || DEFAULT_ERROR_PLACEHOLDER;
  } else if (isLoading && showPlaceholder) {
    // While loading, show the image but it will fade in
    // The browser will handle the loading state naturally
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      onError={handleError}
      onLoad={handleLoad}
      placeholder="blur"
      blurDataURL={DEFAULT_PLACEHOLDER}
      unoptimized={imageError} // Skip optimization for error placeholders
      {...props}
    />
  );
};

export default OptimizedImage;
