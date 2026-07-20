import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyAuthToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "인증 토큰이 없습니다." },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        alias: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 401 },
    );
  }
}
