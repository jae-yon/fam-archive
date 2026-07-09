"use client";

import { useState } from "react";
import { FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from "@/components/ui/card";
import { PostSheet } from "@/components/common/post-sheet";

import { formatDate } from "@/lib/date";

import { useRecentPosts } from "@/hooks/use-posts";
import { Post } from '@/types/post';

export function Board() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>(undefined);
  const [mode, setMode] = useState<"edit" | "view">("edit");

  const { data: recentPosts } = useRecentPosts();

  // 게시글 작성 함수 (edit 모드로 postsheet 열기)
  const handleEdit = () => {
    setSelectedPost(undefined);
    setMode("edit");
    setIsOpen(true);
  };

  // 게시글 상세 보기 함수 (view 모드로 postsheet 열기)
  const handleView = (id: string) => {
    const post = recentPosts?.find((p) => p.id === id);
    if (!post) return;
    setSelectedPost(post as unknown as Post);
    setMode("view");
    setIsOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight ps-2">최근 게시글</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleEdit}>게시글 작성</Button>
          <Button variant="outline">전체 목록 보기</Button>
        </div>
      </div>

      {recentPosts && recentPosts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {recentPosts.map((post) => (
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
                <p className="line-clamp-1 text-muted-foreground">{post.contentText}</p>
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

      <PostSheet open={isOpen} mode={mode} post={selectedPost ?? undefined} onOpenChange={setIsOpen} onModeChange={setMode} />
    </div>
  );
}
