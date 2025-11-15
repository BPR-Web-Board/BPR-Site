"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

export interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  placeholderClassName?: string;
}

/**
 * OptimizedImage component with error handling and loading states
 * Handles timeout errors gracefully by showing fallback or placeholder
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = "",
  showPlaceholder = true,
  placeholderClassName = "image-placeholder",
  className,
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

  // Show placeholder if image failed and no fallback
  if (imageError && !fallbackSrc) {
    return showPlaceholder ? (
      <div className={placeholderClassName} aria-label={alt}>
        <span>Image unavailable</span>
      </div>
    ) : null;
  }

  // Use fallback if primary image failed
  const imageSrc = imageError && fallbackSrc ? fallbackSrc : src;

  return (
    <>
      {isLoading && showPlaceholder && (
        <div className={placeholderClassName} aria-label="Loading...">
          <span>Loading...</span>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? "loading" : "loaded"}`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={imageError} // Skip optimization for fallback images
        {...props}
      />
    </>
  );
};

export default OptimizedImage;
