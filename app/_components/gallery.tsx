"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ImagePlus, ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhotoGallery } from "@/components/common/photo-gallery";
import { PhotoUploadDialog } from "@/components/common/photo-upload-dialog";

import { useRecentPhotos } from "@/hooks/use-galleries";

import { useGetUser } from "@/hooks/use-auth";
                                                                                                                                                                                                                                                                                                                                                                          
export function Gallery() {
  const [uploadOpen, setUploadOpen] = useState(false);

  const [authorized, setAuthorized] = useState(false);

  const { data: user } = useGetUser();

  // 사용자 정보가 조회된다면, 권한 상태를 업데이트
  useEffect(() => {
    setAuthorized(user ? true : false);
  }, [user]);

  const { data: recentPhotos } = useRecentPhotos();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight ps-2">최근 사진</h1>
        {authorized && (
          <Button
            size="icon"
            aria-label="사진 추가"
            onClick={() => setUploadOpen(true)}
          >
            <ImagePlus className="size-4 stroke-[2.25]" aria-hidden />
          </Button>
        )}
      </div>

      {recentPhotos && recentPhotos.length > 0 ? (
        <PhotoGallery photos={recentPhotos} layout="columns" />
      ) : (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <ImageOff className="size-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">사진이 없습니다. 첫 번째 사진을 업로드해주세요.</p>
        </div>
      )}

      <PhotoUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} authorized={authorized} />

      <div className="flex justify-center">
        <Button
          variant="default"
          className="w-full text-sm font-medium"
          data-icon="inline-start"
        >
          갤러리 이동
          <ArrowRight className="size-4 stroke-[2.25]" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
