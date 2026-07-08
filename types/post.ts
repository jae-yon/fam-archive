import { JSONContent } from '@tiptap/react';

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