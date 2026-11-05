"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./MagazineNavigation.css";

const pages = [
  { label: "Issues", href: "/magazine/issues" },
  { label: "Articles", href: "/magazine/archive" },
];

export default function MagazineNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Archive views" className="magazine-navigation">
    {pages.map(page => <Link key={page.href} href={page.href} scroll={false}
      aria-current={pathname === page.href ? "page" : undefined}>{page.label}</Link>)}
  </nav>;
}
