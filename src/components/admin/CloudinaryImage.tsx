// src/components/CloudinaryImage.tsx
"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { getResponsiveUrl, isCloudinaryUrl } from "@/lib/cloudinaryUrl";

interface CloudinaryImageProps extends Omit<ImageProps, "src" | "fill"> {
  src: string;
  width?: number;
  height?: number;
  fill?: boolean;
  cloudinaryOptions?: {
    crop?: "fill" | "scale" | "fit" | "pad" | "thumb";
    quality?: number;
    blur?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  };
}

const CloudinaryImage = ({
  src,
  alt,
  width,
  height,
  fill = false,
  cloudinaryOptions,
  ...rest
}: CloudinaryImageProps) => {
  // Only apply Cloudinary transformations if it's a Cloudinary URL
  const imageUrl =
    isCloudinaryUrl(src) && cloudinaryOptions
      ? getResponsiveUrl(src, {
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          crop: cloudinaryOptions.crop || "fill",
          quality: cloudinaryOptions.quality || 80,
        })
      : src;

  // Use next/image without any special handling if it's not a Cloudinary URL
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill === true ? true : undefined}
      {...rest}
    />
  );
};

export default CloudinaryImage;
