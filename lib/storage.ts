export type AuthTokenPayload = {
  id: string;
  email: string;
};

export type AuthUser = {
  id: string;
  email: string;
  alias: string | null;
};

// 토큰 조회
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
}

// 토큰 설정
export function setAccessToken(token: string): void {
  sessionStorage.setItem("access_token", token);
}

// 토큰 삭제
export function clearAccessToken(): void {
  sessionStorage.removeItem("access_token");
}