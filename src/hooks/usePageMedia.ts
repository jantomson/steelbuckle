"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  isCloudinaryUrl,
  getOptimizedImageUrl,
  extractPublicIdFromUrl,
} from "@/lib/cloudinaryUrl";

// Define the media config type based on Prisma schema
type MediaConfigType = {
  [key: string]: string;
};

// Response type from API
interface MediaApiResponse {
  [key: string]: string;
}

// Global cache to prevent repeated API calls
const mediaCache: Record<string, { data: MediaConfigType; timestamp: number }> =
  {};

// This will be used to invalidate the cache when media configs are updated
let globalCacheBustTimestamp = Date.now();

// Try to get existing timestamp from localStorage on initial load
try {
  if (typeof window !== "undefined") {
    const storedTimestamp = localStorage.getItem("mediaTimestamp");
    if (storedTimestamp && !isNaN(Number(storedTimestamp))) {
      globalCacheBustTimestamp = Number(storedTimestamp);
    }
  }
} catch (e) {
  // localStorage might not be available in SSR context
  console.warn("Failed to read media timestamp from localStorage");
}

// Cache size limit to avoid memory bloat
const CACHE_SIZE_LIMIT = 20;

// Function to create a cache key
const createCacheKey = (pagePrefix: string, keys: string[]): string => {
  return `${pagePrefix}:${keys.sort().join(",")}`;
};

// Helper to maintain a limited size cache
const addToMediaCache = (key: string, data: MediaConfigType) => {
  // Create sorted list of cache entries by timestamp (oldest first)
  const entries = Object.entries(mediaCache).sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  // If we're at the limit, remove the oldest entries
  while (entries.length >= CACHE_SIZE_LIMIT) {
    const oldest = entries.shift();
    if (oldest) {
      delete mediaCache[oldest[0]];
    }
  }

  // Add the new entry
  mediaCache[key] = {
    data,
    timestamp: Date.now(),
  };
};

// Custom event for cross-component communication
const MEDIA_UPDATED_EVENT = "media-cache-updated";

// Check localStorage for updates on interval
if (typeof window !== "undefined") {
  // Check localStorage for updates every 2 seconds
  setInterval(() => {
    try {
      const storedTimestamp = localStorage.getItem("mediaTimestamp");
      if (
        storedTimestamp &&
        Number(storedTimestamp) > globalCacheBustTimestamp
      ) {
        const oldTimestamp = globalCacheBustTimestamp;
        globalCacheBustTimestamp = Number(storedTimestamp);
        // console.log(
        //   `Media timestamp updated from ${oldTimestamp} to ${globalCacheBustTimestamp}`
        // );

        // Dispatch event for components to refresh
        const event = new CustomEvent(MEDIA_UPDATED_EVENT, {
          detail: { timestamp: globalCacheBustTimestamp },
        });
        window.dispatchEvent(event);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, 2000);
}

/**
 * Custom hook to load media references from database
 * @param pagePrefix The prefix for the page's media keys (e.g., "railway_maintenance_page")
 * @param defaultImages Default image mapping in case the DB doesn't have entries
 * @returns Object containing loaded media and loading state
 */
export function usePageMedia(
  pagePrefix: string,
  defaultImages: MediaConfigType = {}
) {
  const [mediaConfig, setMediaConfig] =
    useState<MediaConfigType>(defaultImages);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const fetchingMedia = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const forceRefreshRef = useRef(false);
  const requestInProgressRef = useRef(false);
  const lastFetchTimestampRef = useRef(0);

  // Memoize the default images object to prevent recreating on each render
  const memoizedDefaults = useMemo(() => defaultImages, []);

  // Always include critical keys based on pagePrefix
  const effectiveKeys = useMemo(() => {
    const baseKeys = Object.keys(memoizedDefaults);

    if (
      pagePrefix === "about" &&
      !baseKeys.includes("main_image") &&
      !baseKeys.includes("about.main_image")
    ) {
      return [...baseKeys, "main_image", "about.main_image"];
    }

    return baseKeys;
  }, [memoizedDefaults, pagePrefix]);

  // Memoize the cache key for consistency
  const cacheKey = useMemo(
    () => createCacheKey(pagePrefix, effectiveKeys),
    [pagePrefix, effectiveKeys]
  );

  // Track cache timestamp locally to prevent unnecessary re-renders
  const cacheTimestampRef = useRef(globalCacheBustTimestamp);

  // Function to force a fresh fetch bypassing cache
  const forceMediaRefresh = useCallback(() => {
    forceRefreshRef.current = true;

    // Clear this specific entry from cache
    delete mediaCache[cacheKey];

    // Re-fetch media data
    if (isMounted.current) {
      setLoading(true);
      cacheTimestampRef.current = globalCacheBustTimestamp;
      // console.log(
      //   `Forced media refresh for ${pagePrefix}, new timestamp: ${cacheTimestampRef.current}`
      // );
    }
  }, [cacheKey, pagePrefix]);

  // Listen for media update events from other components
  useEffect(() => {
    // Define the event handler
    const handleMediaUpdate = (e: CustomEvent) => {
      // console.log(
      //   `Media update event received in usePageMedia for ${pagePrefix}`
      // );
      // Only reload if the timestamp is newer than our current one
      if (e.detail && e.detail.timestamp > cacheTimestampRef.current) {
        cacheTimestampRef.current = e.detail.timestamp;

        // Force a refresh
        forceRefreshRef.current = true;
        delete mediaCache[cacheKey]; // Clear this specific cache entry

        if (isMounted.current) {
          setLoading(true);
        }
      }
    };

    // Check localStorage for timestamp changes on mount
    try {
      if (typeof window !== "undefined") {
        const storedTimestamp = localStorage.getItem("mediaTimestamp");
        if (
          storedTimestamp &&
          Number(storedTimestamp) > cacheTimestampRef.current
        ) {
          // console.log(
          //   `Detected newer timestamp in localStorage for ${pagePrefix}:`,
          //   storedTimestamp
          // );
          cacheTimestampRef.current = Number(storedTimestamp);
          forceRefreshRef.current = true;
          delete mediaCache[cacheKey]; // Clear this specific cache entry

          if (isMounted.current) {
            setLoading(true);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to read media timestamp from localStorage");
    }

    // Add event listener
    window.addEventListener(
      MEDIA_UPDATED_EVENT,
      handleMediaUpdate as EventListener
    );

    // Clean up
    return () => {
      window.removeEventListener(
        MEDIA_UPDATED_EVENT,
        handleMediaUpdate as EventListener
      );
    };
  }, [cacheKey, pagePrefix]);

  // Effect to fetch media configuration
  useEffect(() => {
    // Setup cleanup flag
    isMounted.current = true;

    const loadMediaReferences = async () => {
      // Prevent multiple simultaneous fetches
      if (fetchingMedia.current || requestInProgressRef.current) {
        // console.log(`Skipping fetch for ${pagePrefix} - already in progress`);
        return;
      }

      // Only abort previous requests if we're actually starting a new one
      if (abortControllerRef.current && requestInProgressRef.current) {
        // console.log(`Aborting previous request for ${pagePrefix}`);
        abortControllerRef.current.abort();
        requestInProgressRef.current = false;
      }

      // Create a new AbortController for this fetch
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      fetchingMedia.current = true;
      requestInProgressRef.current = true;
      const fetchStartTime = Date.now();
      lastFetchTimestampRef.current = fetchStartTime;

      try {
        // Check if we should use cache or force refresh
        const shouldUseCache =
          !forceRefreshRef.current &&
          mediaCache[cacheKey] &&
          cacheTimestampRef.current === globalCacheBustTimestamp;

        if (shouldUseCache) {
          // console.log(`Using cached media config for ${pagePrefix}`);
          if (isMounted.current) {
            setMediaConfig({
              ...memoizedDefaults,
              ...mediaCache[cacheKey].data,
            });
            setLoading(false);
          }
          fetchingMedia.current = false;
          requestInProgressRef.current = false;
          return;
        }

        // Reset force refresh flag
        forceRefreshRef.current = false;
        setLoading(true);

        // Handle empty keys case better
        const mediaKeys = effectiveKeys.map((key) =>
          key.includes(".") ? key : `${pagePrefix}.images.${key}`
        );

        // Add pagePrefix version for backward compatibility
        const pageKeys = effectiveKeys.map((key) =>
          key.includes(".") ? key : `${pagePrefix}.${key}`
        );

        // Also add direct keys for the about page (special handling)
        let allKeys = [...new Set([...mediaKeys, ...pageKeys])];

        // If this is the about page, ensure we have the main_image key
        if (pagePrefix === "about") {
          if (!allKeys.includes("about.main_image")) {
            allKeys.push("about.main_image");
          }
          if (!allKeys.includes("about.images.main_image")) {
            allKeys.push("about.images.main_image");
          }
        }

        const keysString = allKeys.join(",");
        // console.log(
        //   `Fetching media for ${pagePrefix} keys: ${keysString || "none"}`
        // );

        // Always try to fetch by keys first, even if keysString is empty
        let updatedConfig = { ...memoizedDefaults };

        try {
          // Add timestamp to bust browser cache
          const url = `/api/media?${
            keysString ? `keys=${encodeURIComponent(keysString)}&` : ""
          }pageId=${encodeURIComponent(
            pagePrefix
          )}&_t=${globalCacheBustTimestamp}`;
          // console.log(`Fetching from URL: ${url}`);

          const response = await fetch(url, { signal });

          if (response.ok) {
            const data = (await response.json()) as MediaApiResponse;
            // console.log(
            //   `Received ${
            //     Object.keys(data).length
            //   } media items for ${pagePrefix}`,
            //   data
            // );

            // Process the response to match both formats of keys
            for (const [key, value] of Object.entries(data)) {
              if (value) {
                updatedConfig[key] = value;

                // Also store the simplified key for easier access
                if (key.startsWith(`${pagePrefix}.images.`)) {
                  const simpleKey = key.replace(`${pagePrefix}.images.`, "");
                  updatedConfig[simpleKey] = value;
                } else if (key.startsWith(`${pagePrefix}.`)) {
                  const simpleKey = key.replace(`${pagePrefix}.`, "");
                  updatedConfig[simpleKey] = value;
                }
              }
            }

            // Save to cache if this is still the latest fetch
            if (lastFetchTimestampRef.current === fetchStartTime) {
              addToMediaCache(cacheKey, { ...data });
            }
          }
        } catch (error) {
          // Only log error if it's not an abort error
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            console.error(`Error fetching media for ${pagePrefix}:`, error);
          }
          // Return early if aborted
          if (signal.aborted) {
            fetchingMedia.current = false;
            requestInProgressRef.current = false;
            return;
          }
        }

        // Only update state if component is still mounted and this is the latest fetch
        if (
          isMounted.current &&
          lastFetchTimestampRef.current === fetchStartTime
        ) {
          setMediaConfig(updatedConfig);
          cacheTimestampRef.current = globalCacheBustTimestamp;
          setLoading(false);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
        fetchingMedia.current = false;
        requestInProgressRef.current = false;
      }
    };

    loadMediaReferences();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current && requestInProgressRef.current) {
        abortControllerRef.current.abort();
        requestInProgressRef.current = false;
      }
    };
  }, [
    pagePrefix,
    cacheKey,
    memoizedDefaults,
    effectiveKeys,
    // Include globalCacheBustTimestamp to trigger refresh when it changes
    globalCacheBustTimestamp,
  ]);

  // Helper to get media URL from config - memoized for performance
  const getImageUrl = useCallback(
    (key: string, defaultUrl: string = "", size?: number): string => {
      // Try multiple key formats
      const fullKey = key.includes(".") ? key : `${pagePrefix}.images.${key}`;
      const altKey = key.includes(".") ? key : `${pagePrefix}.${key}`;

      // Debug log keys being checked
      // console.log(
      //   `Looking for image: ${key} -> trying ${fullKey} or ${altKey}`
      // );
      // console.log(`Available keys:`, Object.keys(mediaConfig));

      // Check each possible format for a non-empty value
      let mediaUrl =
        mediaConfig[fullKey] || mediaConfig[altKey] || mediaConfig[key];

      // Log what we found
      // console.log(`Found URL for ${key}:`, mediaUrl);

      // If we have a Cloudinary URL from the database and size is provided, optimize it
      if (mediaUrl && isCloudinaryUrl(mediaUrl) && size) {
        return getOptimizedImageUrl(mediaUrl, size);
      }

      // If we found a URL (Cloudinary or otherwise), return it
      if (mediaUrl) {
        return mediaUrl;
      }

      // If defaultUrl is a Cloudinary URL, use it directly
      if (defaultUrl && isCloudinaryUrl(defaultUrl)) {
        // console.log(`Using Cloudinary default URL: ${defaultUrl}`);
        if (size) {
          return getOptimizedImageUrl(defaultUrl, size);
        }
        return defaultUrl;
      }

      // As a last resort, use the provided default URL
      // console.log(`Using default URL: ${defaultUrl}`);
      return defaultUrl;
    },
    [mediaConfig, pagePrefix]
  );

  // Function to identify a Cloudinary URL and extract public ID
  const getPublicId = useCallback((url: string): string | null => {
    if (!url || !isCloudinaryUrl(url)) {
      return null;
    }
    return extractPublicIdFromUrl(url);
  }, []);

  // Function to invalidate the specific cache entry - memoized
  const invalidateCache = useCallback(() => {
    delete mediaCache[cacheKey];
    forceRefreshRef.current = true;
    if (isMounted.current) {
      setLoading(true);
    }
  }, [cacheKey]);

  // Return a stable object reference
  return useMemo(
    () => ({
      mediaConfig,
      loading,
      getImageUrl,
      invalidateCache,
      forceMediaRefresh,
      getPublicId, // Add this new utility function for Cloudinary public IDs
      isCloudinaryUrl, // Expose this utility function directly
    }),
    [
      mediaConfig,
      loading,
      getImageUrl,
      invalidateCache,
      forceMediaRefresh,
      getPublicId,
      isCloudinaryUrl,
    ]
  );
}

// Expose a function to clear the entire cache
export function clearMediaCache() {
  Object.keys(mediaCache).forEach((key) => {
    delete mediaCache[key];
  });
  globalCacheBustTimestamp = Date.now();

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "mediaTimestamp",
        globalCacheBustTimestamp.toString()
      );
    }
  } catch (e) {
    console.warn("Failed to write media timestamp to localStorage");
  }
}

// Function to invalidate all cached media
export function invalidateMediaCache() {
  globalCacheBustTimestamp = Date.now();
  // console.log(`Media cache invalidated at: ${globalCacheBustTimestamp}`);

  try {
    if (typeof window !== "undefined") {
      // Store in localStorage for cross-tab/cross-component communication
      localStorage.setItem(
        "mediaTimestamp",
        globalCacheBustTimestamp.toString()
      );

      // Also dispatch a custom event for same-page communication
      const event = new CustomEvent(MEDIA_UPDATED_EVENT, {
        detail: { timestamp: globalCacheBustTimestamp },
      });
      window.dispatchEvent(event);
    }
  } catch (e) {
    console.warn("Failed to update media timestamp in localStorage");
  }
}
