"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { invalidateMediaCache } from "@/hooks/usePageMedia";
import {
  isCloudinaryUrl,
  extractPublicIdFromUrl,
  getOptimizedImageUrl,
} from "@/lib/cloudinaryUrl";

// Define the TranslationField type to match what's used in page.tsx
interface TranslationField {
  path: string;
  key: string;
  content: string;
}

// Define a simpler media config structure for storing media paths
interface MediaConfig {
  [key: string]: string;
}

interface EditContextProps {
  isEditMode: boolean;
  editableFields: TranslationField[];
  getFieldContent: (path: string) => string;
  getMediaUrl: (key: string, defaultUrl?: string) => string;
  openEditor: (path: string, content: string) => void;
  openMediaPicker: (
    mediaKey: string,
    currentUrl: string,
    title?: string
  ) => void;
  updateContent: (path: string, content: string) => void;
  updateMedia: (key: string, url: string) => void;
  saveChanges: () => Promise<boolean>;
  isEditorOpen: boolean;
  isMediaPickerOpen: boolean;
  closeEditor: () => void;
  closeMediaPicker: () => void;
  currentEditField: { path: string; content: string } | null;
  currentMediaKey: { key: string; url: string; title?: string } | null;
  activeEditField: string | null;
}

const DEFAULT_YOUTUBE_EMBED = "https://www.youtube.com/embed/M3NSg2p3BOg";

const EditContext = createContext<EditContextProps | undefined>(undefined);

interface EditProviderProps {
  children: ReactNode;
  pageId: string;
  isAdminMode?: boolean;
}

// Define the FieldEditorPanel component OUTSIDE the provider
const FieldEditorPanel = React.memo(
  ({
    isOpen,
    activeField,
    content,
    position,
    isDragging,
    onDragStart,
    onSave,
    onCancel,
  }: {
    isOpen: boolean;
    activeField: string | null;
    content: string;
    position: { top: number; left: number };
    isDragging: boolean;
    onDragStart: (e: React.MouseEvent) => void;
    onSave: (content: string) => void;
    onCancel: () => void;
  }) => {
    // Don't render anything if not open or no activeField
    if (!activeField || !isOpen) return null;

    // Self-contained local state for the editor content
    const [localEditContent, setLocalEditContent] = useState(content);

    // Update local content when the parent content changes (on initial open)
    useEffect(() => {
      setLocalEditContent(content);
    }, [content]);

    // Use ref to access the textarea DOM element
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Track cursor position
    const [selection, setSelection] = useState<{ start: number; end: number }>({
      start: 0,
      end: 0,
    });

    // Handle text changes while preserving cursor position
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newStart = e.target.selectionStart;
      const newEnd = e.target.selectionEnd;

      setLocalEditContent(newValue);
      setSelection({ start: newStart || 0, end: newEnd || 0 });
    };

    // Restore cursor position after each render
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(selection.start, selection.end);
      }
    }, [localEditContent, selection]);

    // Handle save action using the local content
    const handleSave = () => {
      onSave(localEditContent);
    };

    const key = activeField.split(".").pop() || "";

    return (
      <div
        className={`fixed z-50 w-full max-w-xl bg-white rounded-lg shadow-xl border border-gray-200 ${
          isDragging ? "opacity-90" : ""
        }`}
        style={{
          top: position.top + "px",
          left: position.left + "px",
          transform: "translateX(-50%)",
          maxHeight: "80vh",
          overflowY: "auto",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <div
          className="flex justify-between items-center bg-green-800 text-white p-3 rounded-t-lg cursor-move"
          onMouseDown={onDragStart}
        >
          <h3 className="text-base font-medium truncate max-w-xs flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 opacity-70"
            >
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
            Muudan: <span className="font-normal opacity-75 ml-1">{key}</span>
          </h3>
        </div>

        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={localEditContent}
            onChange={handleTextChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-800 focus:border-blue-900"
            rows={Math.max(5, localEditContent.split("\n").length)}
            autoFocus
          />

          <div className="mt-6 flex justify-end space-x-4 sticky bottom-0 pb-2 pt-2 bg-white">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Tühista
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-800 text-white rounded-md hover:bg-green-700 font-medium shadow-sm"
            >
              Salvesta
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// MediaGrid component extracted for better rendering control
const MediaGrid = React.memo(
  ({
    mediaLibrary,
    mediaKey,
    onUpdate,
    isLoading,
  }: {
    mediaLibrary: string[];
    mediaKey: { key: string; url: string; title?: string };
    onUpdate: (key: string, url: string) => void;
    isLoading: boolean;
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
                      !(e.target as HTMLImageElement).src.includes(
                        "placeholder"
                      )
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
  }
);

// Fixed MediaPickerPanel component
const MediaPickerPanel = React.memo(
  ({
    isOpen,
    mediaKey,
    mediaLibrary,
    onClose,
    onUpdate,
  }: {
    isOpen: boolean;
    mediaKey: { key: string; url: string; title?: string } | null;
    mediaLibrary: string[];
    onClose: () => void;
    onUpdate: (key: string, url: string) => void;
  }) => {
    // Don't render anything if not open or no mediaKey
    if (!mediaKey || !isOpen) return null;

    // State for upload progress
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(
      mediaLibrary.length === 0
    );

    // Special handling for YouTube embed link
    const isYoutubeEmbed = mediaKey.key === "hero.youtube_embed";
    const [youtubeUrl, setYoutubeUrl] = useState(mediaKey.url);

    // Format the display title - removing anything after a dash
    const displayTitle = mediaKey.title
      ? mediaKey.title.split("-")[0].trim()
      : "";

    // Function to save YouTube URL
    const saveYoutubeUrl = () => {
      onUpdate(mediaKey.key, youtubeUrl);
    };

    // Function to handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset states
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        // Send the file to the server
        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        // Check if the response is OK
        if (!response.ok) {
          let errorMessage = "Üleslaadimine ebaõnnestus";

          try {
            // Try to get JSON error
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            // If not JSON, get text error
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = "Serveri viga. Proovi hiljem uuesti.";
          }

          throw new Error(errorMessage);
        }

        setUploadProgress(100);

        // Parse the response as JSON
        const data = await response.json();

        // Update the media with the new URL
        onUpdate(mediaKey.key, data.url);

        // Success - let progress bar show 100% briefly before closing
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } catch (error) {
        console.error("Faili üleslaadimine ebaõnnestus:", error);
        setUploadError(
          error instanceof Error ? error.message : "Üleslaadimine ebaõnnestus"
        );
        setIsUploading(false);
      }
    };

    // Effect to update loading state when media library changes
    useEffect(() => {
      if (mediaLibrary.length > 0) {
        setIsLoadingLibrary(false);
      }
    }, [mediaLibrary]);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <div className="bg-white rounded-lg m-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center bg-green-800 text-white p-4 rounded-t-lg">
            <h3 className="text-xl font-medium">
              {isYoutubeEmbed ? "Muuda YouTube URLi" : "Vali meedia"}
            </h3>
            <button onClick={onClose} className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {isYoutubeEmbed ? (
              // YouTube URL editor
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="youtubeUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    YouTube manustatud URL
                  </label>
                  <input
                    type="text"
                    id="youtubeUrl"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Sisesta manustatud URL vormingus:
                  https://www.youtube.com/embed/VIDEO_ID
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={saveYoutubeUrl}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Salvesta URL
                  </button>
                </div>
              </div>
            ) : (
              // Standard media picker with upload option
              <div>
                {/* File upload section */}
                <div className="mb-6 border-b pb-6">
                  <div className="flex flex-col">
                    <div className="mb-4 border border-gray-200 p-4 rounded">
                      <label
                        htmlFor="media-upload"
                        className="flex items-center cursor-pointer"
                      >
                        <div className="mr-3 flex items-center justify-center w-8 h-8">
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15 3V27"
                              stroke="#009933"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            <path
                              d="M3 15H27"
                              stroke="#009933"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          Laadi üles uus meedia
                        </span>
                        <input
                          type="file"
                          id="media-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    {/* Upload progress indicator */}
                    {isUploading && (
                      <div className="w-full">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {uploadProgress < 100
                            ? `Üleslaadimine: ${uploadProgress}%`
                            : "Üleslaadimine õnnestus!"}
                        </p>
                      </div>
                    )}

                    {/* Upload error message */}
                    {uploadError && (
                      <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                    )}
                  </div>
                </div>

                {/* Media library grid with loading state */}
                <h4 className="font-medium text-gray-700 mb-3">
                  Olemasolev meedia
                </h4>
                <MediaGrid
                  mediaLibrary={mediaLibrary}
                  mediaKey={mediaKey}
                  onUpdate={onUpdate}
                  isLoading={isLoadingLibrary}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export const EditProvider = ({
  children,
  pageId,
  isAdminMode = false,
}: EditProviderProps) => {
  const { t, currentLang } = useTranslation();
  const [editableFields, setEditableFields] = useState<TranslationField[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>(
    {}
  );
  const [mediaConfig, setMediaConfig] = useState<MediaConfig>({});
  const [editedMedia, setEditedMedia] = useState<MediaConfig>({});

  // Media library with lazy loading
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [currentEditField, setCurrentEditField] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [currentMediaKey, setCurrentMediaKey] = useState<{
    key: string;
    url: string;
    title?: string;
  } | null>(null);
  const [activeEditField, setActiveEditField] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Fetch media configuration from the database when component mounts
  useEffect(() => {
    if (!isAdminMode) return;

    const fetchMediaConfig = async () => {
      try {
        // Fetch all media for this page
        const response = await fetch(
          `/api/media?pageId=${encodeURIComponent(pageId)}`
        );

        if (response.ok) {
          const data = (await response.json()) as Record<string, string>;
          setMediaConfig(data);
        } else {
          console.error("Failed to fetch media configuration");
        }
      } catch (error) {
        console.error("Error fetching media configuration:", error);
      }
    };

    fetchMediaConfig();
  }, [pageId, isAdminMode]);

  // Fetch saved edits from localStorage for offline editing
  useEffect(() => {
    if (!isAdminMode) return;

    // Load edited content
    const savedContent = localStorage.getItem(
      `edited_content_${pageId}_${currentLang}`
    );
    if (savedContent) {
      try {
        setEditedContent(JSON.parse(savedContent));
      } catch (e) {
        console.error("Failed to parse saved content:", e);
      }
    }

    // Load edited media
    const savedMedia = localStorage.getItem(`edited_media_${pageId}`);
    if (savedMedia) {
      try {
        setEditedMedia(JSON.parse(savedMedia));
      } catch (e) {
        console.error("Failed to parse saved media:", e);
      }
    }
  }, [pageId, currentLang, isAdminMode]);

  // Lazy load media only when media picker is opened
  useEffect(() => {
    if (!isMediaPickerOpen || mediaLibrary.length > 0) return;

    const fetchMediaLibrary = async () => {
      try {
        // Fetch media library from API
        const response = await fetch("/api/media/library");

        if (response.ok) {
          const data = await response.json();
          setMediaLibrary(data.items || []);
        } else {
          // Fallback to default media if the API fails
          console.error("Failed to fetch media library, using fallback");
          setMediaLibrary(["/logo.svg", "/naissaare.png", "/Liepaja_(61).jpg"]);
        }
      } catch (error) {
        console.error("Error fetching media library:", error);
        // Fallback to empty array
        setMediaLibrary([]);
      }
    };

    fetchMediaLibrary();
  }, [isMediaPickerOpen, mediaLibrary.length]);

  // Handle mouse down for drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  // Handle drag movement
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setEditorPosition({
        left: e.clientX - dragOffset.x,
        top: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup event listeners
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Function to get content for a specific field
  const getFieldContent = useCallback(
    (path: string): string => {
      // If we have edited this field, use that content
      if (editedContent[path]) {
        return editedContent[path];
      }

      // Otherwise use the translation
      return t(path);
    },
    [editedContent, t]
  );

  // Get media URL by key with fallback
  const getMediaUrl = useCallback(
    (key: string, defaultUrl?: string): string => {
      // First check edited media
      if (editedMedia[key]) {
        return editedMedia[key];
      }

      // Then check loaded media config
      if (mediaConfig[key]) {
        return mediaConfig[key];
      }

      // Fallback to default
      return defaultUrl || "";
    },
    [mediaConfig, editedMedia]
  );

  // Function to open the editor UI for a field
  const openEditor = useCallback(
    (path: string, content: string) => {
      // Only open editor if in admin mode
      if (!isAdminMode) return;

      setCurrentEditField({ path, content });
      setActiveEditField(path);
      setEditContent(content);
      setIsEditorOpen(true);

      // Calculate initial position for editor panel - center of the viewport
      setEditorPosition({
        top: Math.max(100, window.innerHeight / 2 - 150),
        left: window.innerWidth / 2,
      });
    },
    [isAdminMode]
  );

  // Function to open media picker
  const openMediaPicker = useCallback(
    (mediaKey: string, currentUrl: string, title?: string) => {
      // Only open media picker if in admin mode
      if (!isAdminMode) return;

      setCurrentMediaKey({ key: mediaKey, url: currentUrl, title });
      setIsMediaPickerOpen(true);
    },
    [isAdminMode]
  );

  // Function to close the editor
  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setCurrentEditField(null);
    setActiveEditField(null);
  }, []);

  // Function to close the media picker
  const closeMediaPicker = useCallback(() => {
    setIsMediaPickerOpen(false);
    setCurrentMediaKey(null);
  }, []);

  // Function to update content in state
  const updateContent = useCallback(
    (path: string, content: string) => {
      setEditedContent((prev) => {
        const updated = {
          ...prev,
          [path]: content,
        };

        // Save to localStorage for persistence
        localStorage.setItem(
          `edited_content_${pageId}_${currentLang}`,
          JSON.stringify(updated)
        );

        return updated;
      });

      // Update editable fields collection too
      setEditableFields((prevFields) => {
        return prevFields.map((field) => {
          if (field.path === path) {
            return { ...field, content };
          }
          return field;
        });
      });
    },
    [pageId, currentLang]
  );

  // Function to update media in state
  const updateMedia = useCallback(
    (key: string, url: string) => {
      console.log(`EditContext: Updating media ${key} to ${url}`);

      // Add timestamp to URL for cache busting in UI display
      // But store the clean URL (without timestamp) for persistence
      const cleanUrl = url.split("?")[0]; // Remove any existing query parameters
      const urlWithTimestamp = `${cleanUrl}?_t=${Date.now()}`;

      // First update UI immediately with the new URL (with timestamp)
      setMediaConfig((prev) => ({
        ...prev,
        [key]: urlWithTimestamp,
      }));

      // Then update the edited media state for persistence with CLEAN URL
      setEditedMedia((prev) => {
        const updated = {
          ...prev,
          [key]: cleanUrl, // Store clean URL without timestamp for API
        };

        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            `edited_media_${pageId}`,
            JSON.stringify(updated)
          );
        } catch (e) {
          console.error("Failed to save edited media to localStorage:", e);
        }

        return updated;
      });

      // Update mediaTimestamp in localStorage to trigger updates in other components
      const mediaTimestamp = Date.now();
      try {
        localStorage.setItem("mediaTimestamp", mediaTimestamp.toString());
      } catch (e) {
        console.error("Failed to update mediaTimestamp in localStorage:", e);
      }

      // Broadcast the change with specific details about what changed
      try {
        // Create and dispatch custom event with the updated media info
        const event = new CustomEvent("media-cache-updated", {
          detail: {
            timestamp: mediaTimestamp,
            key: key,
            url: urlWithTimestamp,
            source: "editContext",
          },
        });
        console.log("Dispatching media-cache-updated event:", event.detail);
        window.dispatchEvent(event);

        // Also call the global invalidation function to be thorough
        invalidateMediaCache();
      } catch (e) {
        console.error("Error dispatching media update event:", e);
      }

      // Close the media picker
      closeMediaPicker();
    },
    [closeMediaPicker, pageId]
  );

  // Save changes to a specific field
  const saveField = useCallback(
    (content: string) => {
      if (!activeEditField) return;

      updateContent(activeEditField, content);
      closeEditor();
    },
    [activeEditField, closeEditor, updateContent]
  );

  // Cancel editing
  const cancelEditing = useCallback(() => {
    closeEditor();
  }, [closeEditor]);

  // Function to save all changes to the database
  const saveChanges = useCallback(async (): Promise<boolean> => {
    let success = true;

    // Save content changes
    if (Object.keys(editedContent).length > 0) {
      try {
        // Create an array of updates to send to the API
        const updates = Object.entries(editedContent).map(
          ([path, content]) => ({
            path,
            content,
            languageCode: currentLang,
          })
        );

        // Send updates to the API
        const response = await fetch("/api/translations/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates }),
        });

        if (!response.ok) {
          throw new Error("Failed to save translations to database");
        }

        // Clear edited content after successful save
        setEditedContent({});
        localStorage.removeItem(`edited_content_${pageId}_${currentLang}`);
      } catch (error) {
        console.error("Error saving content changes:", error);
        success = false;
      }
    }

    // Save media changes
    if (Object.keys(editedMedia).length > 0) {
      try {
        console.log("Saving media changes:", editedMedia);

        // Format updates for API - URLs in editedMedia should already be clean (no timestamps)
        const mediaUpdates = Object.entries(editedMedia).map(([key, url]) => ({
          referenceKey: key,
          mediaPath: url, // URLs should already be clean in editedMedia
        }));

        console.log("Sending media updates to API:", mediaUpdates);

        // Send media updates to the API
        const mediaResponse = await fetch("/api/media/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates: mediaUpdates }),
        });

        if (!mediaResponse.ok) {
          const errorData = await mediaResponse.json();
          console.error("API error response:", errorData);
          throw new Error(
            `Failed to save media to database: ${
              errorData.details || errorData.error || ""
            }`
          );
        }

        const result = await mediaResponse.json();
        console.log("Media update API response:", result);

        // Update the media config with the clean URLs
        setMediaConfig((prev) => {
          const updated = { ...prev };
          for (const [key, url] of Object.entries(editedMedia)) {
            // Add a timestamp to force new browsers to reload the image
            updated[key] = `${url}?_t=${Date.now()}`;
          }
          console.log("Updated mediaConfig:", updated);
          return updated;
        });

        // Clear edited media after successful save
        setEditedMedia({});
        localStorage.removeItem(`edited_media_${pageId}`);

        // Force refresh of media across components
        invalidateMediaCache();
        localStorage.setItem("mediaTimestamp", Date.now().toString());

        // Force reload of the media library
        setMediaLibrary([]);
      } catch (error) {
        console.error("Error saving media changes:", error);
        success = false;
      }
    }

    return success;
  }, [currentLang, editedContent, editedMedia, pageId]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      isEditMode: isAdminMode,
      editableFields,
      getFieldContent,
      getMediaUrl,
      openEditor,
      openMediaPicker,
      updateContent,
      updateMedia,
      saveChanges,
      isEditorOpen,
      isMediaPickerOpen,
      closeEditor,
      closeMediaPicker,
      currentEditField,
      currentMediaKey,
      activeEditField,
    }),
    [
      isAdminMode,
      editableFields,
      getFieldContent,
      getMediaUrl,
      openEditor,
      openMediaPicker,
      updateContent,
      updateMedia,
      saveChanges,
      isEditorOpen,
      isMediaPickerOpen,
      closeEditor,
      closeMediaPicker,
      currentEditField,
      currentMediaKey,
      activeEditField,
    ]
  );

  return (
    <EditContext.Provider value={contextValue}>
      {children}
      {isAdminMode && (
        <>
          {isEditorOpen && (
            <FieldEditorPanel
              isOpen={isEditorOpen}
              activeField={activeEditField}
              content={editContent}
              position={editorPosition}
              isDragging={isDragging}
              onDragStart={handleDragStart}
              onSave={saveField}
              onCancel={cancelEditing}
            />
          )}
          {isMediaPickerOpen && currentMediaKey && (
            <MediaPickerPanel
              isOpen={isMediaPickerOpen}
              mediaKey={currentMediaKey}
              mediaLibrary={mediaLibrary}
              onClose={closeMediaPicker}
              onUpdate={updateMedia}
            />
          )}
        </>
      )}
    </EditContext.Provider>
  );
};

export const useEdit = (): EditContextProps => {
  const context = useContext(EditContext);

  if (!context) {
    console.warn("useEdit was used outside of EditProvider. Using fallback.");
    // Return a fallback with no-op functions
    return {
      isEditMode: false,
      editableFields: [],
      getFieldContent: (path) => path,
      getMediaUrl: (key, defaultUrl) => defaultUrl || "",
      openEditor: () => {},
      openMediaPicker: () => {},
      updateContent: () => {},
      updateMedia: () => {},
      saveChanges: async () => false,
      isEditorOpen: false,
      isMediaPickerOpen: false,
      closeEditor: () => {},
      closeMediaPicker: () => {},
      currentEditField: null,
      currentMediaKey: null,
      activeEditField: null,
    };
  }

  return context;
};
