"use client";

import { useRouter } from "next/navigation";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/lib/storage";

import { AuthUser, LoginRequest, LoginResponse } from "@/types/auth";

export function useGetUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<AuthUser | null> => {
      const token = getAccessToken();
      
      if (!token) return null;

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        clearAccessToken();
        return null;
      }

      const data = await response.json();

      return data.user;
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginRequest): Promise<LoginResponse> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setAccessToken(data.access_token);  

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      queryClient.setQueryData(["auth", "me"], null);
      clearAccessToken();
    },
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    },
  });
}