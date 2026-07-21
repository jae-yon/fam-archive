import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { imageSize } from "image-size";

import {
  requireAuthFromRequest,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadRootPath } from "@/lib/upload-path";
import type { UploadPhotosResponse } from "@/types/gallery";

export const runtime = "nodejs";

// 안전한 경로 세그먼트 생성
function safePathSegment(input: string) {
  const normalized = input.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    throw new Error("잘못된 식별자 형식입니다.");
  }
  return normalized;
}

export async function POST(request: Request) {
  try {
    await requireAuthFromRequest(request);

    const formData = await request.formData();
    const galleryIdRaw = formData.get("galleryId");

    if (typeof galleryIdRaw !== "string" || !galleryIdRaw) {
      return NextResponse.json(
        { error: "업로드할 사진의 갤러리가 지정되지 않았습니다." },
        { status: 400 },
      );
    }

    const galleryId = safePathSegment(galleryIdRaw);

    const fileValues = formData.getAll("files");
    const files = fileValues.filter((v): v is File => v instanceof File);
    if (files.length === 0) {
      return NextResponse.json(
        { error: "업로드할 파일이 없습니다." },
        { status: 400 },
      );
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

    const result = await prisma.$transaction(async (tx) => {
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

      const response: UploadPhotosResponse = {
        createdCount: created.length,
        photoIds,
        files: created,
      };

      return response;
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return unauthorizedResponse(err);
    }

    const message = err instanceof Error ? err.message : "사진 업로드에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
