import { NextResponse } from "next/server";
import argon2 from "argon2";

import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "계정 정보가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "계정 정보가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    const token = await signAuthToken({
      id: user.id,
      email: user.email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAt: new Date() },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        alias: user.alias,
      },
      access_token: token,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
