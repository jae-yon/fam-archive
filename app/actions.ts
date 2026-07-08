"use server";

import { prisma } from '@/lib/prisma';
import type { SavePostInput } from '@/types/post';

interface GetPostsOptions {
  // 한 페이지에 보여지는 게시글 수
  limit?: number;
  // 페이지 번호
  page?: number;
  // 검색어
  search?: string;
  // 카테고리 ID
  categoryId?: string;
  // 정렬 기준
  sort?: "createdAt" | "title"
  // 정렬 방향
  order?: "asc" | "desc";
}

// 전체 게시글 조회
export async function getPosts(options: GetPostsOptions) {
  const posts = await prisma.post.findMany({
    take: options.limit ?? 10,
    skip: (options.page ?? 1 - 1) * (options.limit ?? 10),
    where: {
      title: {
        contains: options.search ?? "",
      },
      categoryId: options.categoryId ?? undefined,
    },
    orderBy: {
      [options.sort ?? "createdAt"]: options.order ?? "desc",
    },
    include: {
      category: true,
      tags: true,
      images: true,
    },
  });
  return posts;
}

// 전체 카테고리 조회
export async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

// 전체 갤러리 조회
export async function getGalleries() {
  const galleries = await prisma.gallery.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return galleries;
}

// 게시글 상세 조회
export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: id
    }
  });
  return post;
}

export async function createPost(post: SavePostInput) {
  const newPost = await prisma.post.create({
    data: {
      title: post.title,
      content: post.content as object,
      contentText: post.contentText,
      createdAt: post.createdAt,
      categoryId: post.categoryId,
      tags: {
        connect: post.tagIds.map((id) => ({ id })),
      },
      images: {
        connect: post.imageIds.map((id) => ({ id })),
      },
    },
    include: {
      category: true,
      tags: true,
      images: true,
    },
  });
  
  return newPost;
}

export async function updatePost(post: SavePostInput & { id: string }) {
  const updatedPost = await prisma.post.update({
    where: {
      id: post.id
    },
    data: {
      title: post.title,
      content: post.content as object,
      contentText: post.contentText,
      createdAt: post.createdAt,
      categoryId: post.categoryId,
      tags: {
        set: post.tagIds.map((id) => ({ id })),
      },
      images: {
        set: post.imageIds.map((id) => ({ id })),
      },
    },
    include: {
      category: true,
      tags: true,
      images: true,
    },
  });
  return updatedPost;
}

export async function deletePost(id: string) {
  const deletedPost = await prisma.post.delete({
    where: {
      id: id
    },
    include: {
      category: true,
      tags: true,
      images: true,
    },
  });
  return deletedPost;
}