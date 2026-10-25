import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `zalo_voici_${Date.now()}.jpg`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            title="Tải ảnh về máy"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
        />
      </div>
    </div>
  );
};
