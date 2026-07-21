import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_MAX_AGE,
  getRequestToken,
  verifyAuthToken,
} from "@/lib/jwt";
import type { AuthUser } from "@/types/auth";

export class UnauthorizedError extends Error {
  constructor(message = "권한이 없습니다.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

async function findAuthUser(userId: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      alias: true,
    },
  });
}

async function getAuthUserFromToken(token: string): Promise<AuthUser> {
  try {
    const payload = await verifyAuthToken(token);
    const user = await findAuthUser(payload.id);

    if (!user) {
      throw new UnauthorizedError("사용자를 찾을 수 없습니다.");
    }

    return user;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError("유효하지 않은 토큰입니다.");
  }
}

/** API Route용: Request에서 Bearer/쿠키 토큰을 검증하고 사용자 반환 */
export async function requireAuthFromRequest(request: Request): Promise<AuthUser> {
  const token = getRequestToken(request);

  if (!token) {
    throw new UnauthorizedError("인증 토큰이 없습니다.");
  }

  return getAuthUserFromToken(token);
}

/** Server Action용: httpOnly 쿠키 토큰을 검증하고 사용자 반환 */
export async function requireAuth(): Promise<AuthUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new UnauthorizedError("권한이 없습니다.");
  }

  return getAuthUserFromToken(token);
}

/** 로그인 응답에 인증 쿠키 설정 */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_TOKEN_MAX_AGE,
  });
}

/** 로그아웃 응답에서 인증 쿠키 제거 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** API에서 UnauthorizedError를 401 JSON으로 변환 */
export function unauthorizedResponse(error: unknown) {
  const message =
    error instanceof UnauthorizedError
      ? error.message
      : "권한이 없습니다.";

  return NextResponse.json({ error: message }, { status: 401 });
}
