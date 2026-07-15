"use client";

import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface BoardSearchbarProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function BoardSearchbar({ value, onValueChange }: BoardSearchbarProps) {
  return (
    <InputGroup className="w-full max-w-72 sm:w-72">
      <InputGroupAddon align="inline-start">
        <Search className="size-4" aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder="검색"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-label="검색"
      />
    </InputGroup>
  );
}
