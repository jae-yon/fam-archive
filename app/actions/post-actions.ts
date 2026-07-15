"use server";

import { prisma } from "@/lib/prisma";
import type { SavePostInput } from "@/types/post";

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
  sort?: "createdAt" | "title";
  // 정렬 방향
  order?: "asc" | "desc";
}

// 게시글 목록 조회
export async function getPosts(options: GetPostsOptions = {}) {
  const limit = options.limit ?? 10;
  const page = options.page ?? 1;
  const search = options.search?.trim();

  const posts = await prisma.post.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { contentText: { contains: search } },
            ],
          }
        : {}),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
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

// 게시글 상세 조회
export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });
  return post;
}

// 게시글 생성
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

// 게시글 수정
export async function updatePost(post: SavePostInput & { id: string }) {
  const updatedPost = await prisma.post.update({
    where: {
      id: post.id,
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

// 게시글 삭제
export async function deletePost(id: string) {
  const deletedPost = await prisma.post.delete({
    where: {
      id: id,
    },
    include: {
      category: true,
      tags: true,
      images: true,
    },
  });
  return deletedPost;
}

// 게시글 카테고리 조회
export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { label: "asc" },
  });
  return categories;
}

// 카테고리 생성
export async function createCategory(data: { label: string }) {
  const label = data.label.trim();

  if (!label) {
    throw new Error("카테고리 이름을 입력해주세요.");
  }

  const existing = await prisma.category.findFirst({
    where: { label },
  });

  if (existing) {
    throw new Error("이미 존재하는 카테고리 이름입니다.");
  }

  const category = await prisma.category.create({
    data: { label },
  });
  return category;
}

// 카테고리 수정
export async function updateCategory(data: { id: string; label: string }) {
  const label = data.label.trim();

  if (!label) {
    throw new Error("카테고리 이름을 입력해주세요.");
  }

  const current = await prisma.category.findUnique({
    where: { id: data.id },
  });

  if (!current) {
    throw new Error("존재하지 않는 카테고리입니다.");
  }

  const existing = await prisma.category.findFirst({
    where: {
      label,
      NOT: { id: data.id },
    },
  });

  if (existing) {
    throw new Error("이미 존재하는 카테고리 이름입니다.");
  }

  if (current.label === label) {
    return current;
  }

  const category = await prisma.category.update({
    where: { id: data.id },
    data: { label },
  });
  return category;
}

// 카테고리 삭제
export async function deleteCategory(data: { id: string }) {
  const category = await prisma.category.findUnique({
    where: { id: data.id },
    include: {
      posts: { select: { id: true }, take: 1 },
    },
  });

  if (!category) {
    throw new Error("존재하지 않는 카테고리입니다.");
  }

  if (category.posts.length > 0) {
    throw new Error("카테고리에 게시글이 있어 삭제할 수 없습니다.");
  }

  await prisma.category.delete({
    where: { id: data.id },
  });

  return { id: data.id };
}