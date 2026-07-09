export const PHOTO_UPLOAD_LIMITS = {
  // 업로드 최대 파일 용량 (100MB)
  maxFileSizeBytes: 100 * 1024 * 1024,
  // 허용된 파일 형식
  acceptedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
  ],
} as const;