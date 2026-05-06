"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blog/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      }
      setUploading(false);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        void upload(file);
      }
    },
    [upload],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  };

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-neutral-200">
        <Image
          src={value}
          alt="Featured image"
          width={600}
          height={300}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => onChange(undefined)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-neutral-400 bg-neutral-50"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {dragOver ? (
            <ImageIcon className="w-8 h-8 text-neutral-400" />
          ) : (
            <Upload className="w-8 h-8 text-neutral-400" />
          )}
          <span className="text-sm text-neutral-500">
            Drop an image or click to upload
          </span>
          <span className="text-xs text-neutral-400">
            JPEG, PNG, GIF, WebP (max 5MB)
          </span>
        </div>
      )}
    </div>
  );
}
