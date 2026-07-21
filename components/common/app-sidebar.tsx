"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Blocks, LogIn, LogOut, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { appConfig } from "@/config/app"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { useGetUser, useLogout } from "@/hooks/use-auth"

import { isNavItemActive, NAV_ITEMS } from "@/config/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  
  const { data: user } = useGetUser()
  
  const { mutate: logout } = useLogout()

  const displayName = user?.alias?.trim() || user?.email;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              render={<Link href="/" />}
              tooltip={appConfig.name}
              size="lg"
              className="cursor-default"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Blocks className="size-4 stroke-[2.25]" />
              </div>
              <div className="grid flex-1 text-left text-md leading-tight">
                <span className="truncate font-semibold">{appConfig.name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href} className="mb-2">
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      size="default"
                      className={cn(isActive ? "" : "bg-transparent hover:bg-zinc-100 transition-all duration-300")}
                    >
                      <Icon aria-hidden />
                      <span className="truncate font-medium text-zinc-800">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <div className="flex w-full items-center gap-1 py-4 pe-2 rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                <SidebarMenuButton
                  tooltip={displayName}
                  size="default"
                  className="flex-1 pointer-events-none"
                >
                  <div className="flex aspect-square p-2 items-center justify-center rounded-lg bg-zinc-800">
                    <User className="size-4 stroke-[2.5]" aria-hidden />
                  </div>
                  <span className="truncate font-medium text-zinc-100">
                    {displayName}
                  </span>
                </SidebarMenuButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-300"
                  onClick={() => logout()}
                  aria-label="로그아웃"
                  title="로그아웃"
                >
                  <LogOut className="size-4 stroke-[2.5]" aria-hidden />
                </Button>
              </div>
            ) : (
              <SidebarMenuButton
                render={<Link href="/login" />}
                tooltip="로그인"
                size="default"
                className="bg-zinc-900 hover:bg-zinc-700 text-zinc-100 hover:text-zinc-100 hover:cursor-pointer transition-all duration-300 flex items-center justify-center gap-1"
              >
                <LogIn className="size-4 stroke-[2.25]" aria-hidden />
                <span className="truncate font-medium tracking-wider">로그인</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
