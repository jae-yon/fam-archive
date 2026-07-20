"use client";

import { FileX2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useCategories, usePosts } from "@/hooks/use-posts";

import { Category, Post } from "@/types/post";

import { BoardMenubar } from "@/app/board/_components/board-menubar";

import { Container } from "@/components/common/container";
import { PostSheet } from "@/components/common/post-sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDate } from "@/lib/date";

const ALL_CATEGORY: Category = {id: "all", label: "전체"};

export default function BoardPage() {
  // 카테고리 목록 상태값
  const [categoryList, setCategoryList] = useState<Category[]>([ALL_CATEGORY]);
  // 선택된 카테고리 상태값
  const [selectedCategory, setSelectedCategory] = useState<Category>(ALL_CATEGORY);
  // 검색어 상태값
  const [search, setSearch] = useState("");

  // 게시글 모달 상태값
  const [isOpen, setIsOpen] = useState(false);
  // 게시글 모달 모드 상태값
  const [mode, setMode] = useState<"edit" | "view">("edit");
  // 선택된 게시글 상태값
  const [selectedPost, setSelectedPost] = useState<Post | undefined>(undefined);

  // 게시글 조회 옵션 상태값
  const [options, setOptions] = useState<{ 
    categoryId: string | undefined; 
    search: string | undefined; 
  }>({ 
    categoryId: selectedCategory.id, 
    search: search.trim() || undefined 
  });

  // 카테고리 목록 조회 상태값
  const { data: categories } = useCategories();

  // 카테고리 목록 조회 후 상태값 업데이트
  useEffect(() => {
    if (categories) {
      setCategoryList([ ALL_CATEGORY, ...categories ]);
    }
  }, [categories]);

  // 검색어, 카테고리 변경 시 게시글 조회 옵션 업데이트
  useEffect(() => {
    setOptions({
      categoryId: selectedCategory.id === ALL_CATEGORY.id ? undefined : selectedCategory.id,
      search: search.trim() || undefined
    });
  }, [selectedCategory, search]);

  // 게시글 목록 조회 상태값
  const { data: posts, isLoading: isPostsLoading, isError: isPostsError } = usePosts(options);

  // 게시글 작성 함수 (edit 모드로 postsheet 열기)
  const handleEdit = () => {
    setSelectedPost(undefined);
    setMode("edit");
    setIsOpen(true);
  };

  // 게시글 상세 보기 함수 (view 모드로 postsheet 열기)
  const handleView = (id: string) => {
    const post = posts?.find((p) => p.id === id);
    if (!post) return;
    setSelectedPost(post as unknown as Post);
    setMode("view");
    setIsOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col">
      <BoardMenubar
        categories={categoryList}
        selectedCategory={selectedCategory}
        onSelectedCategoryChange={setSelectedCategory}
        search={search}
        onSearchChange={(value) => setSearch(value ?? "")}
        onCreatePost={handleEdit}
      />

      {/* 게시글 목록 */}
      <div className="p-4">
        {posts && posts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="shadow-none border border-zinc-50 bg-none hover:border-zinc-200 hover:shadow-xs hover:bg-zinc-50 transition-all duration-300 cursor-default rounded-2xl"
                onClick={() => handleView(post.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-500 tracking-wider">
                      {post.category.label}
                    </span>
                    <CardDescription>{formatDate(post.createdAt.toISOString())}</CardDescription>
                  </div>
                  <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-muted-foreground">{post.contentText}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <FileX2 className="size-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">게시글이 없습니다. 첫 번째 게시글을 작성해주세요.</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="p-4">

      </div>

      <PostSheet open={isOpen} mode={mode} post={selectedPost ?? undefined} onOpenChange={setIsOpen} onModeChange={setMode} />
    </div>
  );
}
