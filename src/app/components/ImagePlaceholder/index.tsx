import React from "react";

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = 600,
  height = 400,
  className = "",
}) => {
  return (
    <div
      className={`image-placeholder ${className}`}
      style={{
        width: width === 0 ? "100%" : `${width}px`,
        height: height === 0 ? "100%" : `${height}px`,
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
};

export default ImagePlaceholder;
