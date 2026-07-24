"use client";

import { useRef, useState } from "react";
import { Upload, X, GripVertical, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface ImageItem {
  id?: string;
  image_url: string;
  display_order: number;
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/v1/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Upload failed");
  }

  const data = await response.json();
  return data.data.url;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - images.length;

    if (files.length > remaining) {
      alert(`You can only add ${remaining} more image(s)`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        continue;
      }
    }

    setUploading(true);
    setUploadTotal(files.length);
    setUploadProgress(0);

    const uploaded: ImageItem[] = [];
    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file);
        uploaded.push({ image_url: url, display_order: images.length + uploaded.length });
      } catch {
        alert(`Failed to upload ${file.name}`);
      }
      setUploadProgress((p) => p + 1);
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.map((img, i) => ({ ...img, display_order: i })));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated.map((img, i) => ({ ...img, display_order: i })));
  };

  if (!cloudName) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-gray-400">
        <ImagePlus size={32} className="mx-auto mb-2" />
        <p className="text-sm">Cloudinary not configured</p>
        <p className="text-xs">Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square rounded-lg border border-gray-200 bg-gray-50">
              <img
                src={img.image_url}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveImage(i, i - 1)}
                  disabled={i === 0}
                  className="rounded-full bg-white/90 p-1 text-gray-700 disabled:opacity-30"
                >
                  <GripVertical size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-full bg-white/90 p-1 text-error"
                >
                  <X size={14} />
                </button>
              </div>
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Uploading {uploadProgress}/{uploadTotal}...
              </>
            ) : (
              <>
                <Upload size={16} />
                {images.length === 0 ? "Upload Images" : "Add More Images"}
              </>
            )}
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Max {maxImages} images. JPEG, PNG, WebP, GIF up to 5MB each.
      </p>
    </div>
  );
}
