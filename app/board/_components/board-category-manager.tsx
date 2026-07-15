"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  PencilLine,
  Plus,
  Settings2,
  Tag,
  Trash2,
  Undo2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import type { Category } from "@/types/post";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-posts";

export function BoardCategoryManager() {
  const { data: categories, isLoading, isError } = useCategories();
  const {
    mutate: createCategory,
    isPending: isCreatingCategory,
    error: createError,
    reset: resetCreate,
  } = useCreateCategory();
  const {
    mutate: updateCategory,
    isPending: isUpdatingCategory,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateCategory();
  const {
    mutate: deleteCategory,
    isPending: isDeletingCategory,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteCategory();

  // 카테고리 생성 상태값
  const [isCreating, setIsCreating] = useState(false);
  // 새 카테고리 이름 상태값
  const [newLabel, setNewLabel] = useState("");
  // 수정 중인 카테고리 ID 상태값
  const [editingId, setEditingId] = useState<string | null>(null);
  // 수정 중인 카테고리 이름 상태값
  const [editLabel, setEditLabel] = useState("");
  // 삭제 확인 대상
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // 생성 입력 참조
  const createInputRef = useRef<HTMLInputElement>(null);
  // 수정 입력 참조
  const editInputRef = useRef<HTMLInputElement>(null);

  // 생성 상태값 변경 시 생성 입력 참조 포커스
  useEffect(() => {
    if (isCreating) createInputRef.current?.focus();
  }, [isCreating]);

  // 수정 상태값 변경 시 수정 입력 참조 포커스
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  // 생성 버튼 클릭 시 상태값 초기화 및 생성 상태값 설정
  const handleOpenCreate = () => {
    resetCreate();
    resetUpdate();
    setEditingId(null);
    setEditLabel("");
    setIsCreating(true);
    setNewLabel("");
  };

  // 생성 취소 버튼 클릭 시 상태값 초기화
  const handleCancelCreate = () => {
    resetCreate();
    setIsCreating(false);
    setNewLabel("");
  };

  // 생성 제출
  const handleSubmitCreate = (event: FormEvent) => {
    event.preventDefault();
    const label = newLabel.trim();
    if (!label || isCreatingCategory) return;

    createCategory(label, {
      onSuccess: () => {
        setIsCreating(false);
        setNewLabel("");
      },
    });
  };

  // 수정 버튼 클릭 시 상태값 초기화 및 수정 상태값 설정
  const handleStartEdit = (category: Category) => {
    resetCreate();
    resetUpdate();
    setIsCreating(false);
    setNewLabel("");
    setEditingId(category.id);
    setEditLabel(category.label);
  };

  // 수정 취소 버튼 클릭 시 상태값 초기화
  const handleCancelEdit = () => {
    resetUpdate();
    setEditingId(null);
    setEditLabel("");
  };

  // 수정 제출
  const handleSubmitEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editingId || isUpdatingCategory) return;

    const label = editLabel.trim();
    if (!label) return;

    updateCategory(
      { id: editingId, label },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditLabel("");
        },
      },
    );
  };

  // 삭제 확인 다이얼로그 열기
  const handleRequestDelete = (category: Category) => {
    resetDelete();
    setDeleteTarget(category);
  };

  // 삭제 확인
  const handleConfirmDelete = () => {
    if (!deleteTarget || isDeletingCategory) return;

    const targetId = deleteTarget.id;
    deleteCategory(targetId, {
      onSuccess: () => {
        if (editingId === targetId) {
          handleCancelEdit();
        }
        setDeleteTarget(null);
      },
    });
  };

  return (
    <>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              size="icon"
              type="button"
              variant="outline"
              aria-label="카테고리 관리"
            />
          }
        >
          <Settings2 className="size-4 stroke-[2.25]" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 gap-3 p-3">
          {isLoading && (
            <div className="flex flex-col gap-2 px-1">
              <Skeleton className="h-8 w-full rounded-full" />
              <Skeleton className="h-8 w-full rounded-full" />
              <Skeleton className="h-8 w-full rounded-full" />
            </div>
          )}

          {isError && (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              카테고리 목록을 불러오지 못했습니다.
            </p>
          )}

          {!isLoading && !isError && (
            <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {categories?.length === 0 && (
                <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                  등록된 카테고리가 없습니다.
                </li>
              )}

              {categories?.map((category) => {
                if (editingId === category.id) {
                  return (
                    <li key={category.id}>
                      <form
                        onSubmit={handleSubmitEdit}
                        className="flex flex-col gap-2 p-2"
                      >
                        <Input
                          ref={editInputRef}
                          value={editLabel}
                          onChange={(event) => {
                            if (updateError) resetUpdate();
                            setEditLabel(event.target.value);
                          }}
                          placeholder="카테고리 이름"
                          aria-label="카테고리 이름 수정"
                          aria-invalid={!!updateError}
                          disabled={isUpdatingCategory}
                          className="h-9 rounded-full px-3"
                          onKeyDown={(event) => {
                            if (event.key === "Escape" && !isUpdatingCategory) {
                              handleCancelEdit();
                            }
                          }}
                        />
                        {updateError && (
                          <p className="px-1 text-xs text-destructive">
                            {updateError.message}
                          </p>
                        )}
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="submit"
                            variant="secondary"
                            size="icon-xs"
                            disabled={!editLabel.trim() || isUpdatingCategory}
                            aria-label="저장"
                          >
                            <Check className="size-3 stroke-[2.25]" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-xs"
                            onClick={handleCancelEdit}
                            disabled={isUpdatingCategory}
                            aria-label="취소"
                          >
                            <Undo2 className="size-3 stroke-[2.25]" aria-hidden />
                          </Button>
                        </div>
                      </form>
                    </li>
                  );
                }

                return (
                  <li
                    key={category.id}
                    className="group flex items-center gap-1 rounded-full px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    <Tag
                      className="size-3.5 shrink-0 stroke-[2.25] text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {category.label}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`${category.label} 수정`}
                      onClick={() => handleStartEdit(category)}
                    >
                      <PencilLine className="size-3" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label={`${category.label} 삭제`}
                      onClick={() => handleRequestDelete(category)}
                    >
                      <Trash2 className="size-3" aria-hidden />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <Separator />

          {isCreating ? (
            <form
              onSubmit={handleSubmitCreate}
              className="flex flex-col gap-2 px-1"
            >
              <Input
                ref={createInputRef}
                value={newLabel}
                onChange={(event) => {
                  if (createError) resetCreate();
                  setNewLabel(event.target.value);
                }}
                placeholder="카테고리 이름"
                aria-label="새 카테고리 이름"
                aria-invalid={!!createError}
                disabled={isCreatingCategory}
                className="h-9 rounded-full px-3"
                onKeyDown={(event) => {
                  if (event.key === "Escape" && !isCreatingCategory) {
                    handleCancelCreate();
                  }
                }}
              />
              {createError && (
                <p className="px-1 text-xs text-destructive">
                  {createError.message}
                </p>
              )}
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="submit"
                  variant="secondary"
                  size="icon-xs"
                  disabled={!newLabel.trim() || isCreatingCategory}
                  aria-label="추가"
                >
                  <Plus className="size-3 stroke-[2.25]" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  onClick={handleCancelCreate}
                  disabled={isCreatingCategory}
                  aria-label="취소"
                >
                  <Undo2 className="size-3 stroke-[2.25]" aria-hidden />
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex w-full cursor-pointer items-center gap-2 rounded-full border border-dashed border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-800"
            >
              <Plus className="size-4 shrink-0 stroke-[2.25]" aria-hidden />
              카테고리 추가
            </button>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeletingCategory) {
            resetDelete();
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="shadow-sm" size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="bg-red-500/10 p-2.5 rounded-full">
              <Trash2 className="h-6 w-6 text-red-500" />
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm font-normal">
              <span className="font-medium">
                &quot;{deleteTarget?.label}&quot;
              </span>{" "}
              카테고리를 영구적으로 삭제합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-center text-xs text-destructive">
              {deleteError.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCategory}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingCategory}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
