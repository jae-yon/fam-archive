import { JSONContent } from '@tiptap/react';

export interface Tag {
  id: string;
  name: string;
}

export interface Image {
  id: string;
  url: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface Post {
  id: string;

  title: string;
  content: JSONContent;
  contentText: string;

  category: Category;

  createdAt: string;

  tags: Tag[];
  images: Image[];
}