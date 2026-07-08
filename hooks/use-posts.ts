"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { 
  createPost, 
  deletePost, 
  updatePost, 
  getCategories, 
  getPost, 
  getPosts, 
} from "@/app/actions";

import type { Post, PostContent, SavePostInput } from "@/types/post";

function toSavePostInput(post: Post): SavePostInput {
  return {
    id: post.id || undefined,
    title: post.title,
    content: JSON.parse(JSON.stringify(post.content)) as PostContent,
    contentText: post.contentText,
    createdAt: post.createdAt,
    categoryId: post.categoryId,
    tagIds: post.tags.map((tag) => tag.id),
    imageIds: post.images.map((image) => image.id),
  };
}

export function useRecentPosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts({ limit: 5, sort: "createdAt", order: "desc" }),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPost(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: Post) => createPost(toSavePostInput(post)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: Post) => {
      if (!post.id) throw new Error("Post id is required for update");
      return updatePost({ ...toSavePostInput(post), id: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}