"use client";

import Image from "next/image";
import { useState } from "react";

const DEFAULT_FALLBACK = "/nature/default.jpg";

/**
 * Image with graceful fallback to a local placeholder when the remote
 * URL 404s (common with seeded Unsplash links). Use anywhere we render
 * crop / scheme / pest images sourced from external URLs.
 */
export function CropImage({
  src,
  alt,
  fallback = DEFAULT_FALLBACK,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: {
  src?: string;
  alt: string;
  fallback?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const initial = src && src.trim() !== "" ? src : fallback;
  const [current, setCurrent] = useState(initial);

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
      unoptimized={current.startsWith("http")}
    />
  );
}
