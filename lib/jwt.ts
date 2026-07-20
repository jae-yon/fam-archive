import { jwtVerify, SignJWT } from 'jose';

import { AuthTokenPayload } from '@/types/auth';

const AUTH_TOKEN_MAX_AGE = parseInt(process.env.JWT_EXPIRATION_TIME || "86400");

// 시크릿키 조회
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

// 토큰 추출
export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();

  return token || null;
}

// 인증 토큰 생성
export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({ id: payload.id, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_MAX_AGE}s`)
    .sign(getJwtSecret());
}

// 인증 토큰 검증
export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  const id = typeof payload.id === "string" ? payload.id : null;
  const email = typeof payload.email === "string" ? payload.email : null;

  if (!id || !email) {
    throw new Error("Invalid token payload");
  }

  return { id, email } satisfies AuthTokenPayload;
}