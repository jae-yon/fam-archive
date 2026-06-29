"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { isNavItemActive, navItems } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function AppBottomNavbar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href)
          const Icon = item.icon

          return (
            <li key={item.href} className="flex-1 p-2">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary bg-zinc-100"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                /> */}
                <Icon
                  aria-hidden
                  className={cn("size-5 shrink-0", isActive && "stroke-[2.25]")}
                />
                <span className={cn(isActive && "font-semibold")}>
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
