"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * React Query 클라이언트 프로바이더
 */
export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60 * 1 },
    }
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}