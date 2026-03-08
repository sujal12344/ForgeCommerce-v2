"use client";
import { ImagePlusIcon, TrashIcon } from "lucide-react";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { Button } from "./button";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

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

  const onSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (
      result.info &&
      typeof result.info === "object" &&
      result.info.secure_url
    ) {
      onChange(result.info.secure_url);
    }
  };

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
                variant={"destructive"}
                size={"icon"}
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
      <CldUploadWidget onSuccess={onSuccess} uploadPreset="ijboojeu">
        {({ open }) => {
          const onClick = () => {
            open();
          };
          return (
            <Button
              type="button"
              disabled={disabled}
              variant={"secondary"}
              onClick={onClick}
            >
              <ImagePlusIcon className="h-5 w-4 mr-3" />
              Upload an image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
