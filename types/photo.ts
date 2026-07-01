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

  createdAt: string;
}