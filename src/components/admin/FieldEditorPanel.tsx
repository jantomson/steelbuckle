import React, { useState, useEffect, useRef } from "react";

interface FieldEditorPanelProps {
  isOpen: boolean;
  activeField: string | null;
  content: string;
  position: { top: number; left: number };
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const FieldEditorPanel: React.FC<FieldEditorPanelProps> = ({
  isOpen,
  activeField,
  content,
  position,
  isDragging,
  onDragStart,
  onSave,
  onCancel,
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
};
