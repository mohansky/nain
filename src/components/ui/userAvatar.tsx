"use client";

import Image from "next/image";
import { useState } from "react";
import { getInitials } from "@/lib/utils";
import { AvatarProps } from "@/types";

export default function UserAvatar({
  src,
  alt,
  size = 40,
  fallback,
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Check if src is valid
  const isValidSrc =
    src &&
    typeof src === "string" &&
    src.trim() !== "" &&
    src !== " " &&
    !imageError;

  const getFallbackText = () => {
    if (fallback) return fallback;
    return getInitials(alt);
  };

  return (
    <div className={`avatar ${className}`}>
      <div
        className={`hover:ring-primary ring-offset-base-100 hover:ring-2 ring-offset-2 w-${Math.floor(
          size / 4
        )}  rounded-full`}
      >
        {isValidSrc ? (
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="bg-primary text-primary-content rounded-full flex items-center justify-center font-bold"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
          >
            {getFallbackText()}
          </div>
        )}
      </div>
    </div>
  );
}
