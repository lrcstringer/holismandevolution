"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/resources", label: "Resources" },
  { href: "/discussion", label: "Discussion" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-page backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-heading text-accent text-xl font-bold tracking-wide hover:text-accent-hover transition-colors"
        >
          Holism &amp; Evolution
        </Link>
        <ul className="flex gap-8">
          {links.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm tracking-widest uppercase transition-colors duration-200 pb-0.5 ${
                    isActive
                      ? "text-accent font-semibold border-b-2 border-accent"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
