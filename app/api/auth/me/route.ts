import { NextResponse } from "next/server";

import {
  requireAuthFromRequest,
  setAuthCookie,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth";
import { getRequestToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAuthFromRequest(request);
    const token = getRequestToken(request);

    const response = NextResponse.json({ user });

    // sessionStorage 토큰만 있는 기존 세션도 server action용 쿠키로 동기화
    if (token) {
      setAuthCookie(response, token);
    }

    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorizedResponse(error);
    }

    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 401 },
    );
  }
}
