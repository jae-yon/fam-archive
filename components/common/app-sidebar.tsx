"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Blocks } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { appConfig } from "@/config/app"
import { isNavItemActive, NAV_ITEMS } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

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
                      className={cn("hover:bg-zinc-100 transition-all duration-300")}
                    >
                      <Icon
                        aria-hidden
                        className={cn(isActive && "stroke-[2.25]")}
                      />
                      <span className="truncate font-normal">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
