// components/admin/ResetConfirmationModal.tsx
import React from "react";

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Kinnita taastamine
        </h3>
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Oled taastamas andmebaasi algseisu. See toiming kustutab kõik
            praegused andmed ja taastab vaikesisu.
          </p>
          <p className="text-red-600 font-medium mb-2">Hoiatus:</p>
          <ul className="list-disc pl-5 text-red-600 space-y-1 mb-2">
            <li>Kõik tehtud muudatused lähevad kaotsi</li>
            <li>Algseisuks loetakse viimaseid seadistusi</li>
            <li>Seda toimingut ei saa tagasi võtta</li>
          </ul>
          <p className="text-gray-700 font-medium mt-4">
            Kas oled kindel, et soovid jätkata?
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Tühista
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Taasta"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmationModal;
