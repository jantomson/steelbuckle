import React, { useState } from "react";

interface VideoUrlEditorProps {
  isOpen: boolean;
  videoKey: string;
  currentUrl: string;
  onClose: () => void;
  onUpdate: (key: string, url: string) => void;
}

const VideoUrlEditor: React.FC<VideoUrlEditorProps> = ({
  isOpen,
  videoKey,
  currentUrl,
  onClose,
  onUpdate,
}) => {
  const [url, setUrl] = useState(currentUrl);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(videoKey, url);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center bg-green-800 text-white p-4 rounded-t-lg">
          <h3 className="text-xl font-medium">Muuda Video URLi</h3>
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="videoUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Video Embed URL
            </label>
            <input
              type="text"
              id="videoUrl"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://player.vimeo.com/video/123456789 or https://www.youtube.com/embed/AbCdEfG"
              autoFocus
            />
          </div>

          <div className="bg-gray-50 p-4 -mx-6 -mb-6 rounded-b-lg">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Tühista
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700"
              >
                Salvesta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUrlEditor;
