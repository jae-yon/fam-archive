"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGallery,
  deleteGallery,
  getGalleries,
  getPhotos,
  updateGallery,
} from "@/app/actions/gallery-actions";

import { UploadPhotosResponse, UploadPhotosInput } from '@/types/gallery';

/**
 * 갤러리 목록 조회
 */
export function useGalleries() {
  return useQuery({
    queryKey: ["galleries"],
    queryFn: () => getGalleries(),
  });
}

/**
 * 갤러리 생성
 */
export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createGallery({ title }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

/**
 * 갤러리 수정
 */
export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; title: string }) => updateGallery(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

/**
 * 갤러리 삭제
 */
export function useDeleteGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGallery({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["galleries"] });
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

/**
 * 최근 사진 목록 조회 (전체 사진 중 가장 최근 사진 10개 노출)
 */
export function useRecentPhotos() {
  return useQuery({
    queryKey: ["photos", "recent"],
    queryFn: () => getPhotos({ limit: 10, sort: "createdAt", order: "desc" }),
  });
}

/**
 * 사진 목록 조회 (갤러리 페이지에서 사용, 갤러리 ID를 통해 필터링)
 */
export function usePhotos(galleryId?: string | null) {
  return useQuery({
    queryKey: ["photos", galleryId ?? "all"],
    queryFn: () =>
      getPhotos({
        galleryId: galleryId ?? undefined,
        sort: "createdAt",
        order: "desc",
      }),
  });
}

/**
 * 사진 업로드
 */
export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation<UploadPhotosResponse, Error, UploadPhotosInput>({
    mutationFn: async ({ galleryId, files }) => {
      const formData = new FormData();
      formData.set("galleryId", galleryId);
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "사진 업로드에 실패했습니다.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      return (await res.json()) as UploadPhotosResponse;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["galleries"] });
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
