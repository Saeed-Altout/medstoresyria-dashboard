"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconUpload, IconTrash, IconStar } from "@tabler/icons-react";
import {
  useUploadProductImage,
  useDeleteProductImage,
  useSetPrimaryImage,
} from "@/lib/hooks/products";
import type { ProductImage } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

interface ProductImageManagerProps {
  productId: string;
  images: ProductImage[];
}

export function ProductImageManager({ productId, images }: ProductImageManagerProps) {
  const t = useTranslations("products");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();
  const primaryMutation = useSetPrimaryImage();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    uploadMutation.mutate({ id: productId, formData: fd });
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {images.length}/{MAX_IMAGES} {t("images_label")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={images.length >= MAX_IMAGES || uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload data-icon="inline-start" />
          {t("upload_images")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {images.length === 0 ? (
        <div className="flex items-center justify-center h-32 rounded-lg border border-dashed text-muted-foreground text-sm">
          {t("no_images")}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative rounded-md overflow-hidden border-2 ${
                img.is_primary ? "border-primary" : "border-border"
              }`}
            >
              <div className="aspect-square relative">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>
              {img.is_primary && (
                <span className="absolute top-1 start-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {t("primary_badge")}
                </span>
              )}
              <div className="absolute bottom-0 inset-x-0 flex bg-black/60 p-1 gap-1">
                {!img.is_primary && (
                  <button
                    type="button"
                    title={t("set_primary")}
                    disabled={primaryMutation.isPending}
                    onClick={() => primaryMutation.mutate({ id: productId, imageId: img.id })}
                    className="flex-1 flex items-center justify-center text-white hover:text-yellow-300 transition-colors"
                  >
                    <IconStar className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title={t("delete_image")}
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate({ id: productId, imageId: img.id })}
                  className="flex-1 flex items-center justify-center text-white hover:text-red-400 transition-colors"
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
