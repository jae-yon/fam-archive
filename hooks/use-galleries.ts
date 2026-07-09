"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGalleries, getPhotos } from "@/app/actions/gallery-actions";

import { UploadPhotosResponse, UploadPhotosInput } from '@/types/gallery';

export function useGalleries() {
  return useQuery({
    queryKey: ["galleries"],
    queryFn: () => getGalleries(),
  });
}

export function useRecentPhotos() {
  return useQuery({
    queryKey: ["photos"],
    queryFn: () => getPhotos({ limit: 10, sort: "createdAt", order: "desc" }),
  });
}

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
