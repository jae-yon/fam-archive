"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BoardSearchbar } from "@/app/board/_components/board-searchbar";
import { BoardCategoryFilter } from "@/app/board/_components/board-category-filter";
import { BoardCategoryManager } from "@/app/board/_components/board-category-manager";

import { Category } from "@/types/post";

interface BoardMenubarProps {
  categories: Category[];
  selectedCategory: Category;
  onSelectedCategoryChange: (category: Category) => void;
  search: string | undefined;
  onSearchChange: (search: string | undefined) => void;
  onCreatePost: () => void;
}

export function BoardMenubar({
  categories,
  selectedCategory,
  onSelectedCategoryChange,
  search,
  onSearchChange,
  onCreatePost,
}: BoardMenubarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-4 py-2">
      <BoardCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectedCategoryChange={onSelectedCategoryChange}
      />

      <BoardSearchbar 
        value={search ?? ""} 
        onValueChange={(value) => onSearchChange(value ? value : undefined)} 
      />

      <Button
        size="icon"
        type="button"
        aria-label="게시글 작성"
        onClick={onCreatePost}
      >
        <Pencil className="size-4 stroke-[2.25]" aria-hidden />
      </Button>

      <BoardCategoryManager />
    </div>
  );
}
