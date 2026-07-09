"use server";

import { prisma } from "@/lib/prisma";
import { UploadPhotosResponse } from '@/types/gallery';
import { imageSize } from "image-size";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// 갤러리 목록 조회
export async function getGalleries() {
  const galleries = await prisma.gallery.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return galleries;
}

// 이미지 업로드 경로 반환
function getUploadRootPath() {
  const uploadPath = process.env.UPLOAD_PATH;

  if (!uploadPath) {
    throw new Error("업로드 환경변수를 찾을 수 없습니다.");
  }

  // 절대경로로 정규화
  return path.resolve(uploadPath);
}

// 안전한 경로 세그먼트 생성
function safePathSegment(input: string) {
  const normalized = input.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    throw new Error("잘못된 식별자 형식입니다.");
  }
  return normalized;
}

// 사진 업로드
export async function uploadPhotos(
  formData: FormData,
): Promise<UploadPhotosResponse> {
  const galleryIdRaw = formData.get("galleryId");

  if (typeof galleryIdRaw !== "string" || !galleryIdRaw) {
    throw new Error("업로드할 사진의 갤러리가 지정되지 않았습니다.");
  }

  const galleryId = safePathSegment(galleryIdRaw);

  const fileValues = formData.getAll("files");
  const files = fileValues.filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    throw new Error("업로드할 파일이 없습니다.");
  }

  const uploadRoot = getUploadRootPath();
  const galleryDir = path.join(uploadRoot, "galleries", galleryId);
  await mkdir(galleryDir, { recursive: true });

  const last = await prisma.galleryPhoto.findFirst({
    where: { galleryId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  let nextSortOrder = (last?.sortOrder ?? 0) + 1;

  return await prisma.$transaction(async (tx) => {
    const created: UploadPhotosResponse["files"] = [];
    const photoIds: string[] = [];

    for (const file of files) {
      const originalName = file.name || "unknown";
      // 과도한 확장자 방지
      const ext = path.extname(originalName).slice(0, 16);
      const filename = `${crypto.randomUUID()}${ext}`;
      const absolutePath = path.join(galleryDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absolutePath, buffer);

      // DB에는 "업로드 루트 기준 상대경로"를 저장 (환경에 따라 루트가 달라도 이식 가능)
      const relativePath = path
        .join("galleries", galleryId, filename)
        .replaceAll("\\", "/");

      // 일부 포맷(예: HEIC)은 파싱이 실패할 수 있어 best-effort로 처리
      let width: number | undefined;
      let height: number | undefined;
      try {
        const dimensions = imageSize(buffer);
        width = dimensions.width ?? undefined;
        height = dimensions.height ?? undefined;
      } catch {
        // ignore
      }

      const photo = await tx.photo.create({
        data: {
          filename,
          originalName,
          url: relativePath,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          width,
          height,
        },
        select: { id: true },
      });

      await tx.galleryPhoto.create({
        data: {
          galleryId,
          photoId: photo.id,
          sortOrder: nextSortOrder++,
        },
      });

      photoIds.push(photo.id);
      created.push({
        originalName,
        filename,
        relativePath,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        width,
        height,
      });
    }

    return {
      createdCount: created.length,
      photoIds,
      files: created,
    };
  });
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
  return photos;
}