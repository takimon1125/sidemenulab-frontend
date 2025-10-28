import * as React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }} onClick={onClose} />

      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto z-50">
        {/* ヘッダー */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
