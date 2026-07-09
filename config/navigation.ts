import type { LucideIcon } from "lucide-react"
import { NotebookText, Home, Image } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/board", label: "게시판", icon: NotebookText },
  { href: "/gallery", label: "갤러리", icon: Image },
]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
