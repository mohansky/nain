"use client";
// src/components/layout/dock.tsx
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/auth/user-menu";
import DashboardIcon from "../icons/dashboard";
import HomeIcon from "../icons/home";
import SearchIcon from "../icons/search";
import MoreIcon from "../icons/more";
import { NavLink } from "@/types";

const navLinks: NavLink[] = [
  {
    href: "/dashboard",
    icon: DashboardIcon,
    label: "Dashboard",
  },
  {
    href: "/dashboard/home",
    icon: HomeIcon,
    label: "Home",
  },
  {
    href: "/dashboard/search",
    icon: SearchIcon,
    label: "Search",
  },
  {
    href: "/dashboard/more",
    icon: MoreIcon,
    label: "More",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for home route
    if (href === "/home") {
      return pathname === href;
    }
    // For other routes, check if pathname starts with href
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="navbar bg-base-100 px-5">
      <div className="navbar-start">
        <Link href="/" className="text-xl">
          <Image src="/nainlogo.svg" width={40} height={40} alt="Nain Logo" />
          <span className="sr-only">Nain</span>
        </Link>
      </div>

      <div className="navbar-end">
        <UserMenu />
      </div>

      <div className="dock dock-lg bg-base-200">
        {navLinks.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <button className={cn(isActive(href) && "dock-active")}>
              <Icon className="mx-auto" />
              <span className="dock-label">{label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
