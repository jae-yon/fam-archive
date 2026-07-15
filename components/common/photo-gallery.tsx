'use client';

import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import {
  ColumnsPhotoAlbum,
  MasonryPhotoAlbum,
  RowsPhotoAlbum,
  type LayoutType,
  type RenderImageContext,
  type RenderImageProps,
  type ResponsiveParameter,
  type ResponsiveSizes,
} from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'react-photo-album/styles.css';
import 'yet-another-react-lightbox/styles.css';

import { toAlbumPhotos, type GalleryAlbumPhoto } from '@/lib/photo-album';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';
import type { Photo } from '@/types/gallery';

/**
 * 기본 크기 설정
 * @returns 기본 크기 설정
 */
const DEFAULT_SIZES: ResponsiveSizes = {
  size: '1168px',
  sizes: [
    { viewport: '(max-width: 767px)', size: 'calc(100vw - 32px)' },
    { viewport: '(max-width: 1279px)', size: 'calc(100vw - 288px)' },
  ],
};

/**
 * 기본 컬럼 수 계산
 * @param containerWidth - 컨테이너 너비
 * @returns 컬럼 수
 */
const DEFAULT_COLUMNS: ResponsiveParameter = (containerWidth) => {
  if (containerWidth < 400) return 2;
  if (containerWidth < 800) return 3;
  return 4;
};

/**
 * 
 * @param props - 이미지 렌더링 컴포넌트 속성
 * @param context - 이미지 렌더링 컴포넌트 컨텍스트
 * @returns 이미지 렌더링 컴포넌트
 */
function renderNextImage(
  { alt = '', title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext<GalleryAlbumPhoto>,
) {
  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-102 hover:shadow-sm"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        fill
        src={photo.src}
        alt={alt}
        title={title}
        sizes={sizes}
        className="object-cover"
        priority
      />
      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-4 py-3 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {formatDate(photo.source.createdAt)}
      </span>
    </div>
  );
}

/**
 * 사진 갤러리 레이아웃
 */
export type PhotoGalleryLayout = LayoutType;

/**
 * 사진 갤러리 속성
 */
export interface PhotoGalleryProps {
  photos: Photo[];
  layout?: PhotoGalleryLayout;
  className?: string;
  columns?: ResponsiveParameter;
  targetRowHeight?: ResponsiveParameter;
  spacing?: ResponsiveParameter;
  sizes?: ResponsiveSizes;
  enableLightbox?: boolean;
  onPhotoClick?: (photo: Photo, index: number) => void;
}

/**
 * 사진 갤러리 컴포넌트
 * @param props - 사진 갤러리 속성
 * @returns 사진 갤러리 컴포넌트
 */
export function PhotoGallery({
  photos,
  layout = 'masonry',
  className,
  columns = DEFAULT_COLUMNS,
  targetRowHeight,
  spacing,
  sizes = DEFAULT_SIZES,
  enableLightbox = true,
  onPhotoClick,
}: PhotoGalleryProps) {
  const albumPhotos = useMemo(() => toAlbumPhotos(photos), [photos]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const lightboxSlides = useMemo(
    () =>
      photos.map((photo) => ({
        src: photo.originalUrl,
        alt: photo.alt ?? photo.title ?? photo.filename,
        title: photo.title,
        description: photo.description,
      })),
    [photos],
  );

  const handleClick = useCallback(
    ({ index }: { index: number }) => {
      if (enableLightbox) {
        setLightboxIndex(index);
      }
      onPhotoClick?.(photos[index], index);
    },
    [enableLightbox, onPhotoClick, photos],
  );

  const commonProps = {
    photos: albumPhotos,
    onClick: handleClick,
    render: { image: renderNextImage },
    defaultContainerWidth: 1200,
    sizes,
    spacing,
    componentsProps: {
      button: {
        className:
          'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      },
    },
  };

  return (
    <>
      <div className={cn('w-full', className)}>
        {layout === 'rows' && (
          <RowsPhotoAlbum
            {...commonProps}
            targetRowHeight={targetRowHeight ?? 150}
          />
        )}
        {layout === 'columns' && (
          <ColumnsPhotoAlbum {...commonProps} columns={columns} />
        )}
        {layout === 'masonry' && (
          <MasonryPhotoAlbum {...commonProps} columns={columns} />
        )}
      </div>

      {enableLightbox && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={lightboxSlides}
        />
      )}
    </>
  );
}
