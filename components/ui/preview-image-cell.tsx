import Image from "next/image";
import { useState } from "react";

const PreviewCell = ({
  imageUrl,
  label,
}: {
  imageUrl: string;
  label: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        src={imageUrl}
        alt={label}
        width={70}
        height={70}
        className="cursor-pointer rounded object-cover"
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <Image
            src={imageUrl}
            alt={label}
            width={950}
            height={750}
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
};

export default PreviewCell;
