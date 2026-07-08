import type { JSONContent } from '@tiptap/react';

export type PostContent = {
  type?: string;
  content?: PostContent[];
  [key: string]: unknown;
};

export interface Category {
  id: string;
  label: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Image {
  id: string;
  url: string;
}

export interface Post {
  id: string;
  title: string;
  content: JSONContent;
  contentText: string;
  createdAt: string;
  categoryId: string;
  category: Category;
  tags: Tag[];
  images: Image[];
}

/** 서버 액션으로 전달 가능한 직렬화 타입 (category 등 UI 전용 필드 제외) */
export interface SavePostInput {
  id?: string;
  title: string;
  content: PostContent;
  contentText: string;
  createdAt: string;
  categoryId: string;
  tagIds: string[];
  imageIds: string[];
}