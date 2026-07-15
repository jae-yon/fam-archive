"use client";

import { useState } from "react";
import { ImageOff, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGallery } from "@/components/common/photo-gallery";
import { PhotoUploadDialog } from "@/components/common/photo-upload-dialog";

import {
  ALL_GALLERY_ID,
  GallerySidebar,
} from "@/app/gallery/_components/gallery-sidebar";
import { usePhotos } from "@/hooks/use-galleries";

export default function GalleryPage() {
  // 선택된 갤러리 ID
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>(ALL_GALLERY_ID);
  
  // 사진 업로드 다이얼로그 열기 상태
  const [uploadOpen, setUploadOpen] = useState(false);

  const galleryId =
    selectedGalleryId === ALL_GALLERY_ID ? null : selectedGalleryId;
  const { data: photos, isLoading, isError } = usePhotos(galleryId);

  return (
    <div className="flex flex-1">
      <GallerySidebar
        selectedId={selectedGalleryId}
        onSelect={setSelectedGalleryId}
      />
      <div className="min-w-0 flex-1">
        {/* 사진 추가 버튼 (우측 상단 배치, 포토 업로드 다이얼로그 열기) */}
        <div className="flex justify-end border-b border-border px-4 py-2">
          <Button
            size="icon"
            aria-label="사진 추가"
            onClick={() => setUploadOpen(true)}
          >
            <ImagePlus className="size-4 stroke-[2.25]" aria-hidden />
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
        )}

        {isError && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            사진을 불러오지 못했습니다.
          </p>
        )}

        {!isLoading && !isError && photos && photos.length > 0 && (
          <PhotoGallery photos={photos} layout="columns" className="p-4" />
        )}

        {!isLoading && !isError && photos && photos.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <ImageOff className="mx-auto size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {galleryId
                ? "이 갤러리에 등록된 사진이 없습니다."
                : "사진이 없습니다."}
            </p>
          </div>
        )}

        <PhotoUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      </div>
    </div>
  );
}
