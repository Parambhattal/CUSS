import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { convertFileToUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming you have a Dialog component

type ProfileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const file = acceptedFiles[0];
      setFile([file]);
      setFileUrl(convertFileToUrl(file));
      setIsCropModalOpen(true); // Open the crop modal after file selection
    },
    []
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  const onImageLoad = (img: HTMLImageElement) => {
    setImageRef(img);
  };

  const handleCropComplete = (crop: Crop) => {
    if (imageRef && crop.width && crop.height) {
      const croppedImage = getCroppedImg(imageRef, crop);
      if (croppedImage) {
        setCroppedImageUrl(croppedImage);
      }
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): string | null => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL("image/png");
  };

  const handleSaveCroppedImage = () => {
    if (croppedImageUrl) {
      const file = dataURLtoFile(croppedImageUrl, "cropped-image.png");
      setFile([file]);
      fieldChange([file]);
      setFileUrl(croppedImageUrl);
      setIsCropModalOpen(false); // Close the crop modal after saving
    }
  };

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div>
      {/* Dropzone for file upload */}
      <div {...getRootProps()}>
        <input {...getInputProps()} className="cursor-pointer" />
        <div className="cursor-pointer flex-center gap-4">
          <img
            src={croppedImageUrl || fileUrl || "/assets/icons/profile-placeholder.svg"}
            alt="image"
            className="h-24 w-24 rounded-full object-cover object-top"
          />
          <p className="text-primary-500 small-regular md:bbase-semibold">
            Change profile photo
          </p>
        </div>
      </div>

      {/* Crop Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop Your Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {fileUrl && (
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={handleCropComplete}
                aspect={1} // Force a square crop (1:1 aspect ratio)
              >
                <img
                  src={fileUrl}
                  alt="Crop me"
                  onLoad={(e) => onImageLoad(e.currentTarget)}
                />
              </ReactCrop>
            )}
            <Button onClick={handleSaveCroppedImage}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileUploader;