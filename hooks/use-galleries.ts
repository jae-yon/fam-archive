"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGalleries, getPhotos, uploadPhotos } from "@/app/actions/gallery-actions";

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
      return await uploadPhotos(formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["galleries"] });
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
