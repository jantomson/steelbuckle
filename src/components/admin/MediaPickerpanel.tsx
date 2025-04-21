import React, { useState, useEffect } from "react";
import { MediaGrid } from "./MediaGrid";

interface MediaPickerPanelProps {
  isOpen: boolean;
  mediaKey: { key: string; url: string; title?: string } | null;
  mediaLibrary: string[];
  onClose: () => void;
  onUpdate: (key: string, url: string) => void;
}

export const MediaPickerPanel: React.FC<MediaPickerPanelProps> = ({
  isOpen,
  mediaKey,
  mediaLibrary,
  onClose,
  onUpdate,
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
};
