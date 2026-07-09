import type { Photo as PrismaPhoto } from "@/app/generated/prisma/client";
import type { Photo } from "@/types/gallery";

/**
 * @param photo - 데이터베이스에서 조회한 사진 데이터
 * @returns 사진 뷰 데이터 형식으로 변환한 데이터
 */
export function toPhotoView(photo: PrismaPhoto): Photo {
  // 이미지 경로 정규화
  const normalized = photo.url.replaceAll("\\", "/").replace(/^\/+/, "");
  const imageUrl = `/api/photos/${normalized}`;

  return {
    id: photo.id,
    originalUrl: imageUrl,
    thumbnailUrl: imageUrl,
    width: photo.width ?? 1200,
    height: photo.height ?? 800,
    filename: photo.filename,
    size: photo.size ?? 0,
    mimeType: photo.mimeType,
    originalName: photo.originalName ?? undefined,
    alt: photo.caption ?? photo.originalName ?? undefined,
    createdAt: photo.createdAt.toISOString(),
  };
}
