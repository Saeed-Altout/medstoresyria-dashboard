"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconUpload, IconTrash, IconStar } from "@tabler/icons-react";
import { uploadImage, deleteImage, setPrimaryImage } from "@/lib/api/products.api";
import type { ProductImage, ApiResponse } from "@/types";

interface ImageUploaderProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader({ productId, images, onImagesChange }: ImageUploaderProps) {
  const t = useTranslations("products");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation<ProductImage[], AxiosError, File>({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("image", file);
      return uploadImage(productId, fd);
    },
    onSuccess: (newImages) => {
      onImagesChange(newImages);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const deleteMutation = useMutation<void, AxiosError, string>({
    mutationFn: (imageId) => deleteImage(productId, imageId),
    onSuccess: (_, imageId) => {
      onImagesChange(images.filter((img) => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const primaryMutation = useMutation<void, AxiosError, string>({
    mutationFn: (imageId) => setPrimaryImage(productId, imageId),
    onSuccess: (_, imageId) => {
      onImagesChange(
        images.map((img) => ({ ...img, is_primary: img.id === imageId })),
      );
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

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
    uploadMutation.mutate(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("max_images")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={images.length >= 8 || uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload className="size-4 me-2" />
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
          {t("upload_images")}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative rounded-md overflow-hidden border-2 ${
                img.is_primary ? "border-green-500" : "border-border"
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
                <span className="absolute top-1 start-1 bg-green-500 text-white text-xs px-1 rounded">
                  {t("primary_badge")}
                </span>
              )}
              <div className="absolute bottom-0 inset-x-0 flex bg-black/50 p-1 gap-1">
                {!img.is_primary && (
                  <button
                    type="button"
                    title={t("set_primary")}
                    disabled={primaryMutation.isPending}
                    onClick={() => primaryMutation.mutate(img.id)}
                    className="flex-1 flex items-center justify-center text-white hover:text-yellow-300"
                  >
                    <IconStar className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Delete"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(img.id)}
                  className="flex-1 flex items-center justify-center text-white hover:text-red-400"
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
