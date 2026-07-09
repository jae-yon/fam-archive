export interface Gallery {
  id: string;
  title: string;
  description?: string | null;
  thumbnailId?: string | null;
  createdAt: Date | string;
}

export interface Photo {
  id: string;

  originalUrl: string;
  thumbnailUrl: string;

  width: number;
  height: number;

  filename: string;
  size: number;
  mimeType: string;
  
  alt?: string;
  title?: string;
  description?: string;
  originalName?: string;

  createdAt: string;
}

export interface UploadPhotosResponse {
  createdCount: number;
  photoIds: string[];
  files: Array<{
    originalName: string;
    filename: string;
    relativePath: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
  }>;
}

export interface UploadPhotosInput {
  galleryId: string;
  files: File[];
}