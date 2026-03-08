"use client";
import { ClipboardIcon, ImagePlusIcon, TrashIcon } from "lucide-react";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import Image from "next/image";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Button } from "./button";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

type ImageUploadProps = {
  disabled: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  values: string[];
};
const ImageUpload = ({
  disabled,
  onChange,
  onRemove,
  values,
}: ImageUploadProps) => {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const uploadFileToCloudinary = useCallback(
    async (file: File) => {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error(
          "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set"
        );
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Cloudinary upload failed");
      const data = (await res.json()) as { secure_url: string };
      onChange(data.secure_url);
    },
    [onChange]
  );

  // Ctrl+V paste handler
  useEffect(() => {
    if (!mounted) return;
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled) return;
      // Don't intercept paste events in text input fields
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      )
        return;
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find(item => item.type.startsWith("image/"));
      if (!imageItem) return;
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      try {
        await uploadFileToCloudinary(file);
      } catch (err) {
        console.error("Paste upload failed:", err);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [mounted, disabled, uploadFileToCloudinary]);

  const onSuccess = useCallback(
    (result: CloudinaryUploadWidgetResults) => {
      if (
        result.info &&
        typeof result.info === "object" &&
        result.info.secure_url
      ) {
        onChange(result.info.secure_url);
      }
    },
    [onChange]
  );

  if (!mounted) {
    return null;
  }
  return (
    <div>
      <div className="mb-4 flex items-center gap-4 ">
        {values.map(url => (
          <div key={url} className="relative w-50 h-50 rounded-lg ">
            <div className="absolute z-10 top-2 right-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Remove image"
                onClick={() => {
                  onRemove(url);
                }}
              >
                <TrashIcon className="h-5 w-4" />
              </Button>
            </div>
            <Image
              fill
              sizes="200px"
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      {/* This is CldUploadWidget and the whole block of code inside it is taken from next cloudinary docs  */}
      <div className="flex items-center gap-2">
        <CldUploadWidget
          onSuccess={onSuccess}
          uploadPreset={CLOUDINARY_UPLOAD_PRESET}
        >
          {({ open }) => (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={() => open()}
            >
              <ImagePlusIcon className="h-5 w-4 mr-3" />
              Upload an image
            </Button>
          )}
        </CldUploadWidget>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
          <ClipboardIcon className="size-3.5" />
          or paste (Ctrl+V)
        </span>
      </div>
    </div>
  );
};

export default ImageUpload;
