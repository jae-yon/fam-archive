"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCategory,
  createPost,
  deleteCategory,
  deletePost,
  getCategories,
  getPost,
  getPosts,
  updateCategory,
  updatePost,
} from "@/app/actions/post-actions";

import type { Post, PostContent, SavePostInput } from "@/types/post";

/**
 * 게시글 저장 입력 형식 변환
 */
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

interface UsePostsOptions {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "title";
  order?: "asc" | "desc";
}

/**
 * 게시글 목록 조회 (카테고리·검색·페이지 필터)
 */
export function usePosts(options: UsePostsOptions = {}) {
  const {
    categoryId,
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  } = options;

  return useQuery({
    queryKey: ["posts", "list", { categoryId, search, page, limit, sort, order }],
    queryFn: () =>
      getPosts({
        categoryId,
        search,
        page,
        limit,
        sort,
        order,
      }),
  });
}

/**
 * 최근 게시글 목록 조회 (최대 5개 메인 페이지에 노출)
 */
export function useRecentPosts() {
  return useQuery({
    queryKey: ["posts", "recent"],
    queryFn: () => getPosts({ limit: 5, sort: "createdAt", order: "desc" }),
  });
}

/**
 * 게시글 상세 조회
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPost(id),
  });
}

/**
 * 카테고리 목록 조회
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
}

/**
 * 게시글 생성
 */
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

/**
 * 게시글 수정
 */
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

/**
 * 게시글 삭제
 */
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

/**
 * 카테고리 생성
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (label: string) => createCategory({ label }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

/**
 * 카테고리 수정
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; label: string }) => updateCategory(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

/**
 * 카테고리 삭제
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}