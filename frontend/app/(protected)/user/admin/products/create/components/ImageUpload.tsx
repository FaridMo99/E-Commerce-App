"use client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { IMAGE_MAX_SIZE } from "@monorepo/shared";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type ImageUploadProps = {
  value?: File[];
  onChange?: (files: File[]) => void;
}

export default function ImageUpload({value = [], onChange  }: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>(value);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const handleDrop = (newFiles: File[]) => {
    const combinedFiles = [...files, ...newFiles].slice(0, 5);
    setFiles(combinedFiles);
    onChange?.(combinedFiles);
  };

  useEffect(() => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const removeAll = () => {
    setFiles([]);
    onChange?.([]);
  };

  return (
    <Dropzone
      className="relative"
      maxSize={IMAGE_MAX_SIZE}
      maxFiles={5}
      accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
    >
      <DropzoneEmptyState />
      <DropzoneContent className=" gap-2 mt-2">
        {filePreviews.length > 0 &&
          filePreviews.map((preview, index) => (
            <div
              key={index}
              className=" h-32 w-32 border rounded overflow-hidden "
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover relative"
              />
            </div>
          ))}
      </DropzoneContent>

      {files.length > 0 && (
        <button
          aria-label="remove all images"
          className="absolute top-4 right-4 border"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeAll();
          }}
        >
          <X />
        </button>
      )}
    </Dropzone>
  );
}
