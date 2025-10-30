"use client";

import { useRef } from 'react';

interface UploadScreenProps {
  onImageUpload: (imageData: string) => void;
}

export default function UploadScreen({ onImageUpload }: UploadScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onImageUpload(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageUpload(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            return;
        }
      }
    }
  };

  return (
    <div
      id="paste-area"
      className="border-4 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer transition hover:border-blue-500 hover:bg-gray-700"
      onPaste={handlePaste}
      onClick={() => fileInputRef.current?.click()}
    >
      <label htmlFor="file-input" className="cursor-pointer">
        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="mt-2 text-lg font-semibold">Click to upload or paste image</p>
        <p className="text-sm text-gray-400">PNG, JPG, or WEBP. (Ctrl+V or Cmd+V)</p>
      </label>
      <input
        id="file-input"
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
      />
    </div>
  );
}