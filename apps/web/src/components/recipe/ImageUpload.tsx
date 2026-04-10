'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '@recipehub/shared';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setError('Only JPEG, PNG, WebP and GIF images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const presignJson = await presignRes.json();
      if (!presignRes.ok) {
        setError(presignJson.error?.message ?? 'Failed to get upload URL');
        return;
      }
      const { uploadUrl, publicUrl } = presignJson.data as { uploadUrl: string; publicUrl: string };

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      onChange(publicUrl);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-brand-400 hover:bg-gray-100"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <div className="relative h-48 w-full">
            <Image src={value} alt="Recipe image" fill className="rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="text-3xl mb-2">📷</span>
            <p className="text-sm text-gray-500">
              {uploading ? 'Uploading…' : 'Click to upload image (max 5 MB)'}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
