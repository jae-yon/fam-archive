import type { Photo as AlbumPhoto } from 'react-photo-album';

import type { Photo } from '@/types/photo';

/**
 * 사진 앨범 포토
 */
export type GalleryAlbumPhoto = AlbumPhoto & {
  source: Photo;
};

/**
 * 앱의 Photo 타입을 react-photo-album 형식(src, width, height 등)으로 변환하는 유틸리티 함수
 * @param photos - 사진 목록
 * @returns 사진 앨범 포토 목록
 */
export function toAlbumPhotos(photos: Photo[]): GalleryAlbumPhoto[] {
  return photos.map((photo) => ({
    key: photo.id,
    src: photo.thumbnailUrl,
    width: photo.width,
    height: photo.height,
    alt: photo.alt ?? photo.title ?? photo.filename,
    title: photo.title,
    source: photo,
  }));
}
