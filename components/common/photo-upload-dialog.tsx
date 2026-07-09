"use client";

import {
  AlertCircleIcon,
  ImageIcon,
  ImagePlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PHOTO_UPLOAD_LIMITS } from "@/config/photo";
import { useGalleries, useUploadPhotos } from "@/hooks/use-galleries";
import { cn } from "@/lib/utils";
import { Gallery } from '@/types/gallery';

interface SelectedPhotoFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 파일 크기 포맷팅
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 이미지 파일 검증
function isAcceptedImage(file: File) {
  if (!file.type.startsWith("image/")) return false;
  return PHOTO_UPLOAD_LIMITS.acceptedMimeTypes.includes(
    file.type as (typeof PHOTO_UPLOAD_LIMITS.acceptedMimeTypes)[number],
  );
}

// 선택된 파일 생성
function createSelectedPhoto(file: File): SelectedPhotoFile {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

// 미리보기 URL 취소
function revokePreviewUrls(files: SelectedPhotoFile[]) {
  for (const item of files) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

export function PhotoUploadDialog({ open, onOpenChange }: PhotoUploadDialogProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // 갤러리 목록 조회
  const { data: galleriesData, isLoading: isGalleriesLoading } = useGalleries();

  // 사진 업로드
  const { mutate: uploadPhotos, isPending: isUploading } = useUploadPhotos();

  const galleries = galleriesData ?? [];

  // 선택된 갤러리
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  
  // 선택된 파일 목록
  const [selectedFiles, setSelectedFiles] = useState<SelectedPhotoFile[]>([]);
  
  // 에러 메시지
  const [error, setError] = useState<string | null>(null);
  
  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false);
  
  // 선택된 파일 목록 참조
  const selectedFilesRef = useRef(selectedFiles);
  selectedFilesRef.current = selectedFiles;

  const totalSize = selectedFiles.reduce((sum, item) => sum + item.file.size, 0);

  const resetState = useCallback(() => {
    setSelectedFiles((prev) => {
      revokePreviewUrls(prev);
      return [];
    });
    setSelectedGallery(null);
    setError(null);
    setIsDragging(false);
  }, []); 

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(selectedFilesRef.current);
    };
  }, []);

  // 파일 검증
  const validateFiles = (files: File[]) => {
    const accepted: File[] = [];
    const rejectedNames: string[] = [];

    for (const file of files) {
      if (!isAcceptedImage(file)) {
        rejectedNames.push(file.name);
        continue;
      }
      accepted.push(file);
    }

    if (rejectedNames.length > 0) {
      return {
        accepted: [] as File[],
        error: `이미지 파일만 업로드할 수 있습니다. (${rejectedNames.join(", ")})`,
      };
    }

    if (accepted.length === 0) {
      return { accepted: [] as File[], error: null };
    }

    const acceptedBySize: File[] = [];

    for (const file of accepted) {
      if (file.size > PHOTO_UPLOAD_LIMITS.maxFileSizeBytes) {
        return {
          accepted: acceptedBySize,
          error: `개별 파일은 최대 ${formatFileSize(PHOTO_UPLOAD_LIMITS.maxFileSizeBytes)}까지 업로드할 수 있습니다. (${file.name})`,
        };
      }

      acceptedBySize.push(file);
    }

    return { accepted: acceptedBySize, error: null };
  };

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (incoming.length === 0) return;

    const { accepted, error: validationError } = validateFiles(incoming);

    if (validationError) {
      setError(validationError);
    } else {
      setError(null);
    }

    if (accepted.length === 0) return;

    setSelectedFiles((prev) => [
      ...prev,
      ...accepted.map((file) => createSelectedPhoto(file)),
    ]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    setError(null);
  };

  const handleUpload = () => {
    if (!selectedGallery || selectedFiles.length === 0) return;

    uploadPhotos(
      {
        galleryId: selectedGallery.id,
        files: selectedFiles.map((item) => item.file),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message || "사진 업로드에 실패했습니다.");
        },
      },
    );
  };

  const canUpload =
    selectedFiles.length > 0 && selectedGallery !== null && !isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,48rem)] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-lg font-semibold">사진 업로드</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <Field>
            <FieldLabel htmlFor="gallery-select" className="ms-2">갤러리</FieldLabel>
            <Select
              value={selectedGallery?.title || null}
              onValueChange={(value) => setSelectedGallery(galleries.find((gallery) => gallery.id === value) ?? null)}
              disabled={isGalleriesLoading || isUploading}
            >
              <SelectTrigger
                id="gallery-select"
                className="w-full rounded-lg bg-zinc-100 text-zinc-600"
              >
                <SelectValue
                  placeholder={
                    isGalleriesLoading
                      ? "갤러리를 불러오는 중..."
                      : "업로드할 갤러리를 선택해주세요."
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-lg bg-zinc-100 shadow-none">
                {galleries.map((gallery) => (
                  <SelectItem
                    key={gallery.id}
                    value={gallery.id}
                    className="rounded-none text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
                  >
                    {gallery.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={inputId} className="ms-2">사진 선택</FieldLabel>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={PHOTO_UPLOAD_LIMITS.acceptedMimeTypes.join(",")}
              multiple
              className="sr-only"
              onChange={handleInputChange}
              disabled={isUploading}
            />
            <label
              htmlFor={inputId}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-zinc-300 bg-zinc-100 hover:border-zinc-400 hover:bg-zinc-100/50",
                isUploading && "pointer-events-none opacity-50",
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-200 text-zinc-600">
                <ImagePlusIcon className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-800">
                  클릭하거나 파일을 여기로 드래그하세요
                </p>
                <p className="text-xs text-zinc-500">
                  JPG, PNG, GIF, WEBP, HEIC · 파일당 최대{" "}
                  {formatFileSize(PHOTO_UPLOAD_LIMITS.maxFileSizeBytes)}
                </p>
              </div>
            </label>
            {error ? (
              <FieldError className="flex items-start gap-2">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </FieldError>
            ) : null}
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 px-2">
              <h3 className="text-sm font-medium text-zinc-800">
                선택된 사진 ({selectedFiles.length})
              </h3>
              {selectedFiles.length > 0 ? (
                <span className="text-xs text-zinc-500">
                  총 {formatFileSize(totalSize)}
                </span>
              ) : null}
            </div>

            {selectedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-100 px-4 py-10 text-zinc-500">
                <ImageIcon className="size-8 stroke-[1.5]" />
                <p className="text-sm">선택된 사진이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-100 text-xs text-zinc-500">
                      <tr>
                        <th className="px-4 py-2.5 text-center font-medium">미리보기</th>
                        <th className="px-4 py-2.5 text-center font-medium">파일명</th>
                        <th className="px-4 py-2.5 text-center font-medium">용량</th>
                        <th className="px-4 py-2.5 text-center font-medium">형식</th>
                        <th className="px-4 py-2.5 text-center font-medium">삭제</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedFiles.map((item) => (
                        <tr key={item.id} className="bg-white">
                          <td className="px-4 py-3 flex items-center justify-center">
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="size-12 rounded-lg object-cover"
                            />
                          </td>
                          <td className="max-w-48 truncate px-4 py-3 font-medium text-zinc-800">
                            {item.file.name}
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600">
                            {formatFileSize(item.file.size)}
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600">
                            {item.file.type.replace("image/", "").toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${item.file.name} 삭제`}
                              onClick={() => handleRemoveFile(item.id)}
                            >
                              <Trash2Icon className="size-4 text-zinc-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="grid grid-cols-2 gap-3 sm:hidden">
                  {selectedFiles.map((item) => (
                    <li
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                    >
                      <div className="relative aspect-square bg-zinc-100">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="size-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          className="absolute top-2 right-2 bg-white/90"
                          aria-label={`${item.file.name} 삭제`}
                          onClick={() => handleRemoveFile(item.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-0.5 px-3 py-2">
                        <p className="truncate text-sm font-medium text-zinc-800">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatFileSize(item.file.size)} ·{" "}
                          {item.file.type.replace("image/", "").toUpperCase()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="font-normal"
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={!canUpload}
            onClick={handleUpload}
            className="font-normal"
          >
            <UploadIcon className="size-4 stroke-[2.25]" />
            {isUploading ? "업로드 중..." : "업로드"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
