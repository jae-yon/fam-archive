"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  EllipsisVertical,
  Images,
  PencilIcon,
  Plus,
  TrashIcon,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useCreateGallery,
  useDeleteGallery,
  useGalleries,
  useUpdateGallery,
} from "@/hooks/use-galleries";

const ALL_GALLERY_ID = "all";
const ALL_GALLERY_TITLE = "전체";

export { ALL_GALLERY_ID };

/* 갤러리 아이템 클래스 */
const itemClassName =
  "flex w-full cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-left text-sm font-medium transition-all duration-300";

interface GallerySidebarProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function GallerySidebar({ selectedId, onSelect }: GallerySidebarProps) {
  const { data: galleries, isLoading, isError } = useGalleries();
  const {
    mutate: createGallery,
    isPending: isCreatingGallery,
    error: createError,
    reset: resetCreate,
  } = useCreateGallery();
  const {
    mutate: updateGallery,
    isPending: isUpdatingGallery,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateGallery();
  const {
    mutate: deleteGallery,
    isPending: isDeletingGallery,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteGallery();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const createInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      createInputRef.current?.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
    }
  }, [editingId]);

  // 갤러리 선택 핸들러
  const handleSelect = (id: string) => {
    onSelect(id);
  };

  const handleOpenCreate = () => {
    resetCreate();
    resetUpdate();
    setEditingId(null);
    setEditTitle("");
    setIsCreating(true);
    setNewTitle("");
  };

  const handleCancelCreate = () => {
    resetCreate();
    setIsCreating(false);
    setNewTitle("");
  };

  const handleSubmitCreate = (event: FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || isCreatingGallery) return;

    createGallery(title, {
      onSuccess: (gallery) => {
        setIsCreating(false);
        setNewTitle("");
        onSelect(gallery.id);
      },
    });
  };

  // 수정 시작 핸들러
  const handleStartEdit = (gallery: { id: string; title: string }) => {
    resetCreate();
    resetUpdate();
    setIsCreating(false);
    setNewTitle("");
    onSelect(gallery.id);
    setEditingId(gallery.id);
    setEditTitle(gallery.title);
  };

  // 수정 취소 핸들러
  const handleCancelEdit = () => {
    resetUpdate();
    setEditingId(null);
    setEditTitle("");
  };

  // 수정 제출 핸들러
  const handleSubmitEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editingId || isUpdatingGallery) return;

    const title = editTitle.trim();
    if (!title) return;

    updateGallery(
      { id: editingId, title },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditTitle("");
        },
      },
    );
  };

  // 삭제 요청 핸들러
  const handleRequestDelete = (gallery: { id: string; title: string }) => {
    resetDelete();
    onSelect(gallery.id);
    setDeleteTarget(gallery);
  };

  // 삭제 확인 핸들러
  const handleConfirmDelete = () => {
    if (!deleteTarget || isDeletingGallery) return;

    const targetId = deleteTarget.id;
    deleteGallery(targetId, {
      onSuccess: () => {
        if (selectedId === targetId) {
          onSelect(ALL_GALLERY_ID);
        }
        if (editingId === targetId) {
          handleCancelEdit();
        }
        setDeleteTarget(null);
      },
    });
  };

  return (
    <aside className="flex h-full w-48 shrink-0 flex-col gap-3 border-r border-border py-4 px-4">
      <nav aria-label="갤러리 목록" className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleSelect(ALL_GALLERY_ID)}
          className={cn(
            itemClassName,
            selectedId === ALL_GALLERY_ID
              ? "bg-zinc-900 text-zinc-100"
              : "text-zinc-700 hover:bg-zinc-100",
          )}
        >
          <Images className="size-4 shrink-0 stroke-[2.25]" aria-hidden />
          <span className="truncate">{ALL_GALLERY_TITLE}</span>
        </button>

        {isLoading && (
          <>
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </>
        )}

        {isError && (
          <p className="px-2 py-2 text-sm text-muted-foreground">
            갤러리 목록을 불러오지 못했습니다.
          </p>
        )}

        {!isLoading &&
          !isError &&
          (galleries ?? []).map((gallery) => {
            const isActive = selectedId === gallery.id;
            const isEditing = editingId === gallery.id;

            if (isEditing) {
              return (
                <form
                  key={gallery.id}
                  onSubmit={handleSubmitEdit}
                  className="flex flex-col gap-2 px-1"
                >
                  <Input
                    ref={editInputRef}
                    value={editTitle}
                    onChange={(event) => {
                      if (updateError) resetUpdate();
                      setEditTitle(event.target.value);
                    }}
                    placeholder="갤러리 이름"
                    aria-label="갤러리 이름 수정"
                    aria-invalid={!!updateError}
                    disabled={isUpdatingGallery}
                    className="h-9 rounded-full px-3"
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && !isUpdatingGallery) {
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
                      disabled={!editTitle.trim() || isUpdatingGallery}
                    >
                      <Check className="size-3 shrink-0 stroke-[2.25]" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelEdit}
                      disabled={isUpdatingGallery}
                    >
                      <Undo2 className="size-3 shrink-0 stroke-[2.25]" aria-hidden />
                    </Button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={gallery.id}
                className={cn(
                  "group flex items-center gap-0.5 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-zinc-900 text-zinc-100"
                    : "text-zinc-700 hover:bg-zinc-100",
                )}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(gallery.id)}
                  className={cn(
                    itemClassName,
                    "min-w-0 flex-1",
                    isActive ? "bg-transparent text-zinc-100" : "bg-transparent",
                  )}
                >
                  <Images className="size-4 shrink-0 stroke-[2.25]" aria-hidden />
                  <span className="truncate">{gallery.title}</span>
                </button>

                {isActive && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`${gallery.title} 메뉴`}
                          className="me-1.5 shrink-0 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-100 transition-all duration-300"
                        >
                          <EllipsisVertical className="size-3.5" aria-hidden />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="start" side="bottom" className="min-w-32">
                      <DropdownMenuItem onClick={() => handleStartEdit(gallery)}>
                        <PencilIcon aria-hidden />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleRequestDelete(gallery)}
                      >
                        <TrashIcon aria-hidden />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}

        <Separator className="my-1" />

        {isCreating ? (
          <form
            onSubmit={handleSubmitCreate}
            className="mt-1 flex flex-col gap-2 px-1"
          >
            <Input
              ref={createInputRef}
              value={newTitle}
              onChange={(event) => {
                if (createError) resetCreate();
                setNewTitle(event.target.value);
              }}
              placeholder="갤러리 이름"
              aria-label="갤러리 이름"
              aria-invalid={!!createError}
              disabled={isCreatingGallery}
              className="h-9 rounded-full px-3"
              onKeyDown={(event) => {
                if (event.key === "Escape" && !isCreatingGallery) {
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
                disabled={!newTitle.trim() || isCreatingGallery}
              >
                <Plus className="size-3 shrink-0 stroke-[2.25]" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelCreate}
                disabled={isCreatingGallery}
              >
                <Undo2 className="size-3 shrink-0 stroke-[2.25]" aria-hidden />
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleOpenCreate}
            className={cn(
              itemClassName,
              "text-zinc-500 border border-zinc-200 border-dashed hover:bg-zinc-100 hover:text-zinc-800 hover:border-zinc-300",
            )}
          >
            <Plus className="size-4 shrink-0 stroke-[2.25]" aria-hidden />
            <span className="truncate">갤러리 추가</span>
          </button>
        )}
      </nav>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeletingGallery) {
            resetDelete();
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="shadow-sm" size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="bg-red-500/10 p-2.5 rounded-full">
              <TrashIcon className="h-6 w-6 text-red-500" />
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm font-normal">
              <span className="font-medium">
                &quot;{deleteTarget?.title}&quot;
              </span>{" "}
              갤러리를 삭제합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-center text-xs text-destructive">
              {deleteError.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingGallery}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingGallery}
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
    </aside>
  );
}
