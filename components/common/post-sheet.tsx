"use client";

import { AlertCircleIcon, AlertTriangleIcon, PencilIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { 
  Sheet, 
  SheetContent, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectTrigger, 
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Editor } from "@/components/editor/editor";
import { Viewer } from "@/components/editor/viewer";
import { Separator } from "@/components/ui/separator";
import { DatePickerInput } from "@/components/common/date-picker";
import { Category, Post } from "@/types/post";

import { useCategories, useCreatePost, useDeletePost, useUpdatePost } from "@/hooks/use-posts";
import { formatDate } from "@/lib/date";

interface PostSheetProps {
  open: boolean;
  post?: Post;
  mode: "edit" | "view";
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: "edit" | "view") => void;
}

// 게시글 초기화 상태값
const initialPost = (): Post => ({
  id: "",
  title: "",
  content: {
    type: "doc",
    content: [],
  },
  contentText: "",
  createdAt: new Date().toISOString(),
  categoryId: "",
  category: {
    id: "",
    label: "",
  },
  tags: [],
  images: [],
});

export function PostSheet({ open, post, mode, onOpenChange, onModeChange }: PostSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {mode === "edit" ? (
        <PostForm open={open} data={post} onOpenChange={onOpenChange} />
      ) : (
        <PostView open={open} data={post} onOpenChange={onOpenChange} onModeChange={onModeChange} />
      )}
    </Sheet>
  );
}

function PostForm({ open, data, onOpenChange }: { open: boolean; data?: Post; onOpenChange: (open: boolean) => void }) {
  // 카테고리 데이터 조회
  const { data: categoriesData } = useCategories();

  // 카테고리 항목 상태값 정의
  const [categories, setCategories] = useState<Category[]>([]);

  // 카테고리 항목 데이터를 상태값에 반영
  useEffect(() => {
    setCategories(categoriesData ?? []);
  }, [categoriesData]);

  // 게시글 상태값 정의 및 초기화
  const [post, setPost] = useState<Post>(data ?? initialPost());

  // 게시글 생성 함수 정의
  const { mutate: createPost } = useCreatePost();
  // 게시글 수정 함수 정의
  const { mutate: updatePost } = useUpdatePost();

  // 게시글 기본 상태값 초기화
  useEffect(() => {
    if (!open) return;
    setPost(data ?? initialPost());
  }, [open, data]);

  // 게시글 저장 함수 정의
  const handleSubmit = () => {
    // 게시글 제목, 내용, 내용 텍스트, 카테고리 ID가 모두 있는지 확인
    if (!post.title || !post.content || !post.contentText || !post.categoryId) return;
    if (post.id) {
      // 게시글 수정 함수 호출
      updatePost(post, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    } else {
      // 게시글 생성 함수 호출
      createPost(post, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <SheetContent side="right" className="flex flex-col gap-0 p-0 overflow-hidden h-full min-h-0 min-w-screen lg:min-w-[75vw] border border-r">
      <SheetHeader>
        <SheetTitle>
          <input 
            type="text" 
            placeholder="제목을 입력해주세요."
            value={post.title}
            className="text-xl lg:text-2xl font-semibold tracking-tight w-2/3 border-none outline-none focus:ring-0 focus:ring-offset-0"
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
        </SheetTitle>
      </SheetHeader>

      <Separator className="mb-2" />
      
      <div className="flex items-center gap-2 px-2">
        {/* 작성일 선택 컴포넌트 (기본값: 오늘 날짜) */}
        <DatePickerInput
          value={post.createdAt ? new Date(post.createdAt) : undefined}
          onChange={(date) =>
            setPost({ ...post, createdAt: date?.toISOString() ?? "" })
          }
        />
        {/* 카테고리 선택 컴포넌트 */}
        <Select
          value={post.category.label ?? ""}
          onValueChange={(value) => setPost(
            { ...post, categoryId: value ?? "", category: categories.find((category) => category.id === value) ?? { id: "", label: "" } }
          )}
        >
          <SelectTrigger className="w-1/3 rounded-lg text-zinc-500 bg-zinc-100">
            <SelectValue placeholder="카테고리를 선택해주세요." />
          </SelectTrigger>
          <SelectContent className="min-w-fit rounded-lg shadow-none bg-zinc-100">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="rounded-none text-zinc-500 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-800">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>      

      {/* 에디터 컴포넌트 */}
      <Editor
        content={post.content}
        onUpdate={(json, text) => setPost((prev) => prev ? { ...prev, content: json, contentText: text } : prev)} 
      />

      <Separator />

      <SheetFooter>
        <Button variant="default" className="w-full text-sm font-normal tracking-widest" onClick={handleSubmit}>
          <SaveIcon className="w-4 h-4" />
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}

function PostView({ open, data, onOpenChange, onModeChange }: { open: boolean; data?: Post; onOpenChange: (open: boolean) => void; onModeChange: (mode: "edit" | "view") => void }) {
  if (!data) return null;

  const { mutate: deletePost } = useDeletePost();

  const handleConfirmDelete = () => {
    deletePost(data.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <SheetContent side="right" className="flex flex-col gap-0 p-0 overflow-hidden h-full min-h-0 min-w-screen lg:min-w-[75vw] border border-r">
      <SheetHeader>
        <SheetTitle className="text-xl lg:text-2xl font-semibold tracking-tight">
          {data.title}
        </SheetTitle>
      </SheetHeader>

      <Separator className="mb-2" />
      
      <div className="flex items-center gap-2 px-2">
        <span className="rounded-full bg-zinc-100 text-zinc-600 px-4 py-2 text-xs font-medium tracking-wider cursor-default">
          {formatDate(data.createdAt)}
        </span>
        <span className="rounded-full bg-zinc-100 text-zinc-600 px-4 py-2 text-xs font-medium tracking-wider cursor-default">
          {data.category.label}
        </span>
      </div>

      <Separator className="mt-2" />

      <Viewer content={data.content} />

      <Separator />

      <SheetFooter>
        <Button variant="secondary" className="text-sm font-normal tracking-widest" onClick={() => onModeChange("edit")}>
          <PencilIcon className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" className="text-sm font-normal tracking-widest" />
            }
          >
            <TrashIcon className="w-4 h-4" />
          </AlertDialogTrigger>
          <AlertDialogContent className="shadow-sm" size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="bg-red-500/10 p-2.5 rounded-full">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-normal mt-2">
                <span className="font-medium">"{data.title}"</span> 게시글을 영구적으로 삭제합니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetFooter>
    </SheetContent>
  );
}