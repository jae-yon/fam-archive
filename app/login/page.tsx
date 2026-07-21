"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blocks } from "lucide-react";

import { Container } from "@/components/common/container";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

import { appConfig } from "@/config/app";

import { getAccessToken } from "@/lib/storage";

import { useLogin, useGetUser } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  const { mutateAsync: login, isPending, error, reset } = useLogin();

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      
      const token = getAccessToken();
      
      if (!token) {
        if (!cancelled) setCheckingSession(false);
        return;
      }

      const user = useGetUser();

      if (cancelled) return;

      if (user) {
        router.replace("/");
        return;
      }

      setCheckingSession(false);
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset();

    await login({ email, password });
  }

  if (checkingSession) {
    return (
      <Container className="flex flex-1 items-center justify-center py-10">
        <p className="text-sm text-muted-foreground">확인 중...</p>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 items-center justify-center py-8">
      <Card className="w-full max-w-md shadow-none border border-zinc-50">
        <CardHeader className="flex justify-start items-center gap-2">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Blocks className="size-6 stroke-[2.25]" />
          </div>
          <CardTitle className="text-lg font-bold tracking-tight">
            {appConfig.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="id" className="text-xs ps-2">
                  이메일
                </FieldLabel>
                <Input
                  id="id"
                  name="id"
                  type="text"
                  autoComplete="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-xs ps-2">
                  비밀번호
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isPending}
                />
              </Field>

              {error && (
                <p className="text-xs text-destructive text-center p-2 rounded-full bg-destructive/10" role="alert">
                  {error.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending ? "로그인 중..." : "로그인"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
