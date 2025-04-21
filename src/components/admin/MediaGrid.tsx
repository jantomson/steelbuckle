import React from "react";
import {
  isCloudinaryUrl,
  extractPublicIdFromUrl,
  getOptimizedImageUrl,
} from "@/lib/cloudinaryUrl";

interface MediaGridProps {
  mediaLibrary: string[];
  mediaKey: { key: string; url: string; title?: string };
  onUpdate: (key: string, url: string) => void;
  isLoading: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  mediaLibrary,
  mediaKey,
  onUpdate,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <p className="text-gray-500">Laen...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaLibrary.map((url, index) => {
        // Remove any cache busting parameters for comparison
        const cleanUrl = url.split("?")[0];
        const cleanCurrentUrl = mediaKey.url.split("?")[0];

        // For display, use optimized version of Cloudinary URLs
        const displayUrl = isCloudinaryUrl(url)
          ? getOptimizedImageUrl(url, 200) // Smaller size for the grid view
          : url;

        // For Cloudinary URLs, extract a readable name to display
        const displayName = isCloudinaryUrl(url)
          ? extractPublicIdFromUrl(url)?.split("/").pop() ||
            url.split("/").pop()
          : url.split("/").pop();

        return (
          <div
            key={index}
            onClick={() => onUpdate(mediaKey.key, cleanUrl)}
            className={`cursor-pointer border rounded-lg overflow-hidden 
            hover:border-blue-500 transition-all
            ${cleanCurrentUrl === cleanUrl ? "ring-2 ring-blue-500" : ""}
          `}
          >
            <div className="relative h-40 w-full bg-gray-100 flex items-center justify-center">
              <img
                src={displayUrl}
                alt={`Meedia valik ${index + 1}`}
                className="max-h-32 max-w-full object-contain"
                onError={(e) => {
                  if (
                    !(e.target as HTMLImageElement).src.includes("placeholder")
                  ) {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                    (e.target as HTMLImageElement).alt = "Pilt pole saadaval";
                  }
                }}
              />
            </div>
            <div className="p-2 text-xs text-gray-500 truncate">
              {displayName}
            </div>
          </div>
        );
      })}
    </div>
  );
};
