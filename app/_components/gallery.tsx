import { ArrowRight, ImagePlus } from 'lucide-react';
import { PhotoGallery } from '@/components/common/photo-gallery';
import { Button } from '@/components/ui/button';
import { recentPhotosMock } from '@/config/photo';
import type { Photo } from '@/types/photo';

/**
 * 최근 사진 목록 조회
 * @param photos - 사진 목록
 * @param limit - 최대 노출 사진 수
 * @returns 최근 사진 목록
 */
function getRecentPhotos(photos: Photo[], limit = 12) {
  return [...photos]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function Gallery() {
  const recentPhotos = getRecentPhotos(recentPhotosMock);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight ps-2">최근 사진</h1>
        <Button size="icon" aria-label="사진 추가">
          <ImagePlus className="size-4 stroke-[2.25]" aria-hidden />
        </Button>
      </div>

      <PhotoGallery photos={recentPhotos} layout="columns" />

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
