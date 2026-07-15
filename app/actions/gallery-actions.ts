"use server";

import { prisma } from "@/lib/prisma";
import { toPhotoView } from "@/lib/photo-mapper";
import { getUploadRootPath } from '@/lib/upload-path';

import fs from 'fs';
import path from 'path';

// 갤러리 목록 조회
export async function getGalleries() {
  const galleries = await prisma.gallery.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return galleries;
}

// 갤러리 생성
export async function createGallery(data: { title: string }) {
  const title = data.title.trim();

  if (!title) {
    throw new Error("갤러리 이름을 입력해주세요.");
  }

  const existing = await prisma.gallery.findFirst({
    where: { title },
  });

  if (existing) {
    throw new Error("이미 존재하는 갤러리 이름입니다.");
  }

  const gallery = await prisma.gallery.create({
    data: { title },
  });
  return gallery;
}

// 갤러리 수정
export async function updateGallery(data: { id: string; title: string }) {
  const title = data.title.trim();

  if (!title) {
    throw new Error("갤러리 이름을 입력해주세요.");
  }

  const current = await prisma.gallery.findUnique({
    where: { id: data.id },
  });

  if (!current) {
    throw new Error("존재하지 않는 갤러리입니다.");
  }

  const existing = await prisma.gallery.findFirst({
    where: {
      title,
      NOT: { id: data.id },
    },
  });

  if (existing) {
    throw new Error("이미 존재하는 갤러리 이름입니다.");
  }

  if (current.title === title) {
    return current;
  }

  const gallery = await prisma.gallery.update({
    where: { id: data.id },
    data: { title },
  });
  return gallery;
}

// 갤러리 삭제
export async function deleteGallery(data: { id: string }) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: data.id },
    include: {
      photos: true,
    },
  });

  if (!gallery) {
    throw new Error("존재하지 않는 갤러리입니다.");
  }

  if (gallery.photos.length > 0) {
    throw new Error("갤러리에 사진이 있어 삭제할 수 없습니다.");
  }

  await prisma.gallery.delete({
    where: { id: data.id },
  });

  const uploadDir = path.join(process.cwd(), getUploadRootPath(), data.id);

  try {
    await fs.promises.rm(uploadDir, { recursive: true, force: true });
  } catch (err) {
    // DB 삭제는 이미 커밋됨. 파일 삭제 실패는 별도로 로깅해 추후 정리(cron 등)로 처리.
    console.error(`갤러리 업로드 폴더 삭제 실패 (id: ${data.id}):`, err);
  }

  return true;
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
      galleries: options.galleryId
        ? {
            some: {
              galleryId: options.galleryId,
            },
          }
        : undefined,
    },
    ...(options.limit != null ? { take: options.limit } : {}),
    orderBy: { [options.sort ?? "createdAt"]: options.order ?? "desc" },
  });

  return photos.map(toPhotoView);
}