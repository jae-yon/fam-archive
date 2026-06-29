import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppBottomNavbar } from "@/components/common/app-bottom-navbar";
import { AppSidebar } from "@/components/common/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="flex min-h-full flex-col pb-14 md:pb-0">
        {/* 사이드바 전체를 감싸는 최상위 컨텍스트 프로바이더 - 사이드바의 열림/닫힘 상태를 관리 및 하위 컴포넌트에 전달 */}
        <SidebarProvider>
          {/* 사이드바 컴포넌트 - 사이드바의 내용을 표시 */}
          <AppSidebar />
          {/* 사이드바 우측에 메인 콘텐츠 영역을 감싸는 컨테이너 */}
          <SidebarInset>
            <header className="hidden h-14 shrink-0 items-center gap-2 border-b px-4 md:flex">
              {/* 사이드바 열림/닫힘 버튼 */}
              <SidebarTrigger />
            </header>
            {children}
          </SidebarInset>
        </SidebarProvider>
        {/* 모바일 하단 네비게이션 바 */}
        <AppBottomNavbar />
      </body>
    </html>
  );
}
