"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import {
  DEFAULT_PLACEHOLDER,
  DEFAULT_ERROR_PLACEHOLDER,
} from "../../../../lib/loaders/imageLoader";

export interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad" | "loading"> {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  errorFallback?: React.ReactNode;
  loading?: "lazy" | "eager";
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  errorFallback,
  className = "",
  loading,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Image failed to load: ${src}`);
    }
    setImageError(true);
    setIsLoading(false);
  };

  if (imageError && errorFallback) return <>{errorFallback}</>;

  const imageProps: ImageProps = {
    ...props,
    src: imageError ? fallbackSrc || DEFAULT_ERROR_PLACEHOLDER : src,
    alt: alt || "",
    className: `${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`,
    onError: handleError,
    onLoad: () => setIsLoading(false),
    placeholder: "blur",
    blurDataURL: DEFAULT_PLACEHOLDER,
    unoptimized: true,
  };

  if (!props.priority && loading) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (imageProps as any).loading = loading;
  }

  return <Image {...imageProps} alt={alt || ""} />;
};

export default OptimizedImage;
