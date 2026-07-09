import type { LucideIcon } from "lucide-react"
import { Book, Home, Image } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/board", label: "게시판", icon: Book },
  { href: "/album", label: "앨범", icon: Image },
]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
