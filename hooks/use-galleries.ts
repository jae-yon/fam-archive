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

export function useGalleries() {
  return useQuery({
    queryKey: ["galleries"],
    queryFn: () => getGalleries(),
  });
}

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

export function useRecentPhotos() {
  return useQuery({
    queryKey: ["photos", "recent"],
    queryFn: () => getPhotos({ limit: 10, sort: "createdAt", order: "desc" }),
  });
}

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
