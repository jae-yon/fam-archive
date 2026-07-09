"use server";

import { prisma } from "@/lib/prisma";
import { toPhotoView } from "@/lib/photo-mapper";

// 갤러리 목록 조회
export async function getGalleries() {
  const galleries = await prisma.gallery.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return galleries;
}

interface GetPhotosOptions {
  // 최대 노출 사진 수
  limit?: number;
  // 갤러리 ID
  galleryId?: string;
  // 정렬 필드
  sort?: "createdAt";
  // 정렬 순서
  order?: "asc" | "desc";
}

// 사진 목록 조회
export async function getPhotos(options: GetPhotosOptions) {
  const photos = await prisma.photo.findMany({
    where: {
      galleries: options.galleryId ? {
        some: {
          galleryId: options.galleryId,
        },
      } : undefined,
    },
    take: options.limit ?? 10,
    orderBy: { [options.sort ?? "createdAt"]: options.order ?? "desc" },
  });

  return photos.map(toPhotoView);
}