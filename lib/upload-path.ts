import path from "node:path";

/**
 * 업로드 경로 가져오기
 * @returns 업로드 경로
 */
export function getUploadRootPath() {
  const uploadPath = process.env.UPLOADS_PATH;

  if (!uploadPath) {
    throw new Error("업로드 경로가 설정되어 있지 않습니다.");
  }

  return path.resolve(uploadPath);
}

/**
 * 업로드 파일 경로 해석
 * @param relativeSegments - 상대 경로 세그먼트 배열
 * @returns 절대 경로
 */
export function resolveUploadFilePath(relativeSegments: string[]) {
  const uploadRoot = getUploadRootPath();

  for (const segment of relativeSegments) {
    if (!segment || segment === "." || segment === "..") {
      throw new Error("잘못된 파일 경로입니다.");
    }
  }

  const absolutePath = path.resolve(uploadRoot, ...relativeSegments);
  const relative = path.relative(uploadRoot, absolutePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("잘못된 파일 경로입니다.");
  }

  return absolutePath;
}
