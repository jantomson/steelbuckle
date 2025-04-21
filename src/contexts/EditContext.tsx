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
import { FieldEditorPanel } from "@/components/admin/FieldEditorPanel";
import { MediaPickerPanel } from "@/components/admin/MediaPickerpanel";
import { invalidateTranslationsCache } from "@/hooks/useTranslation";
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
  originalLanguage?: string; // Add this parameter to track the source language
}

export const EditProvider = ({
  children,
  pageId,
  isAdminMode = false,
  originalLanguage,
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

  // IMPORTANT: Lock the editing language to prevent automatic reset
  const initialLanguageRef = useRef<string | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<string>("et");
  const isMounted = useRef(true);

  // Initialize language only once
  useEffect(() => {
    if (initialLanguageRef.current === null) {
      const language =
        originalLanguage ||
        sessionStorage.getItem("adminEditingLanguage") ||
        sessionStorage.getItem("editingLanguage") ||
        currentLang;

      initialLanguageRef.current = language;
      setEditingLanguage(language);

      console.log(`EditContext initialized with locked language: ${language}`);

      // Set this in session storage to ensure consistency
      sessionStorage.setItem("adminEditingLanguage", language);
      sessionStorage.setItem("editingLanguage", language);
    }
  }, [originalLanguage, currentLang]);

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

    // Use editingLanguage, not currentLang for consistent editing
    const editLang = initialLanguageRef.current || editingLanguage;

    // Load edited content for the specific language
    const savedContent = localStorage.getItem(
      `edited_content_${pageId}_${editLang}`
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
  }, [pageId, isAdminMode, editingLanguage]);

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

  const loadEditedContent = useCallback(
    (language: string) => {
      // Load edited content for the specific language
      const savedContent = localStorage.getItem(
        `edited_content_${pageId}_${language}`
      );

      if (savedContent) {
        try {
          setEditedContent(JSON.parse(savedContent));
          console.log(`Loaded edited content for language: ${language}`);
        } catch (e) {
          console.error("Failed to parse saved content:", e);
        }
      } else {
        // Clear current edited content if none exists for the new language
        setEditedContent({});
        console.log(
          `No saved content found for language: ${language}, cleared current edits`
        );
      }
    },
    [pageId]
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

        // Use the locked editingLanguage for saving, not currentLang
        const saveLanguage = initialLanguageRef.current || editingLanguage;

        // Save to localStorage for persistence
        localStorage.setItem(
          `edited_content_${pageId}_${saveLanguage}`,
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
    [pageId, editingLanguage]
  );

  // Function to update media in state
  const updateMedia = useCallback(
    (key: string, url: string) => {
      console.log(`EditContext: Updating media ${key} to ${url}`);

      // 1. Clean the URL by removing any existing query parameters
      const cleanUrl = url.split("?")[0];

      // 2. Store both versions - one for immediate UI update and one for API
      // Add timestamp to URL for cache busting in UI display
      const urlWithTimestamp = `${cleanUrl}?_t=${Date.now()}`;

      // 3. First update UI immediately with the new URL (with timestamp)
      setMediaConfig((prev) => ({
        ...prev,
        [key]: urlWithTimestamp,
      }));

      // 4. Update the edited media state with the CLEAN URL
      setEditedMedia((prev) => {
        const updated = {
          ...prev,
          [key]: cleanUrl, // Store clean URL without timestamp for API
        };

        // 5. Save to localStorage for persistence
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

      // 6. Update mediaTimestamp in localStorage to trigger updates in other components
      const mediaTimestamp = Date.now();
      try {
        localStorage.setItem("mediaTimestamp", mediaTimestamp.toString());
      } catch (e) {
        console.error("Failed to update mediaTimestamp in localStorage:", e);
      }

      // 7. Broadcast the change with specific details
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

        // Also call the global invalidation function
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

    // Use the locked editing language
    const languageToSave = initialLanguageRef.current || editingLanguage;
    console.log(
      `SaveChanges: Using language "${languageToSave}" for translations`
    );

    // Save content changes
    if (Object.keys(editedContent).length > 0) {
      try {
        console.log(
          `Saving ${
            Object.keys(editedContent).length
          } content changes for language: ${languageToSave}`
        );

        // Create an array of updates with the explicitly set language code
        const updates = Object.entries(editedContent).map(
          ([path, content]) => ({
            path,
            content,
            languageCode: languageToSave, // Use the editing language, not admin language
          })
        );

        console.log("Updates payload:", updates);

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

        const result = await response.json();
        console.log("Translation update result:", result);

        // Clear edited content after successful save
        setEditedContent({});
        localStorage.removeItem(`edited_content_${pageId}_${languageToSave}`);
      } catch (error) {
        console.error("Error saving content changes:", error);
        success = false;
      }
    }

    // Save media changes
    if (Object.keys(editedMedia).length > 0) {
      try {
        console.log("Saving media changes:", editedMedia);

        // Format updates for API with clean URLs
        const mediaUpdates = Object.entries(editedMedia).map(([key, url]) => {
          // Ensure the URL is clean without query parameters
          const cleanUrl = url.split("?")[0];
          return {
            referenceKey: key,
            mediaPath: cleanUrl,
          };
        });

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

        // Update the media config with fresh URLs including timestamps
        setMediaConfig((prev) => {
          const updated = { ...prev };
          for (const [key, url] of Object.entries(editedMedia)) {
            // Add a timestamp to force new browsers to reload the image
            const cleanUrl = url.split("?")[0];
            updated[key] = `${cleanUrl}?_t=${Date.now()}`;
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

    // After saving, make sure we preserve the language on refresh
    try {
      // Store the language in sessionStorage with multiple keys for redundancy
      sessionStorage.setItem("adminEditingLanguage", languageToSave);
      sessionStorage.setItem("editingLanguage", languageToSave);
      localStorage.setItem("adminLastEditedLanguage", languageToSave);

      // Add the language to URL to ensure it persists through reload
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("lang", languageToSave);

      // Use history.replaceState to update URL without navigation
      window.history.replaceState({}, "", currentUrl.toString());
    } catch (error) {
      console.error("Error storing language for persistence:", error);
    }

    return success;
  }, [editedContent, editedMedia, pageId, editingLanguage]);

  useEffect(() => {
    const handleAdminLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.language && isMounted.current) {
        console.log(
          `EditContext received language change event: ${event.detail.language}`
        );

        // Update the editing language
        setEditingLanguage(event.detail.language);
        initialLanguageRef.current = event.detail.language;

        // Reload content for the new language
        loadEditedContent(event.detail.language);

        // Force a reload of translation fields
        invalidateTranslationsCache();

        // Update URL to reflect the language change
        try {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set("lang", event.detail.language);
          window.history.replaceState({}, "", currentUrl.toString());
        } catch (e) {
          console.error("Failed to update URL with new language:", e);
        }
      }
    };

    window.addEventListener(
      "admin-language-changed",
      handleAdminLanguageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "admin-language-changed",
        handleAdminLanguageChange as EventListener
      );
    };
  }, [loadEditedContent]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

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
