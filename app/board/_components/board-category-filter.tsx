"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/post";

interface BoardCategoryFilterProps {
  categories: Category[];
  selectedCategory: Category;
  onSelectedCategoryChange: (category: Category) => void;
}

export function BoardCategoryFilter({
  categories,
  selectedCategory,
  onSelectedCategoryChange,
}: BoardCategoryFilterProps) {
  return (
    <Select
      value={selectedCategory.label}
      onValueChange={(next) => {
        if (next !== selectedCategory.id && next != null) onSelectedCategoryChange(categories.find((category) => category.label === next) as Category);
      }}
    >
      <SelectTrigger className="min-w-36 rounded-2xl" aria-label="카테고리 선택">
        <SelectValue>{selectedCategory.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-2xl border border-zinc-100 shadow-none">
        {(categories ?? []).map((category) => (
          <SelectItem 
            key={category.id} 
            value={category.label}
            className="transition-all duration-300"
          >
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
