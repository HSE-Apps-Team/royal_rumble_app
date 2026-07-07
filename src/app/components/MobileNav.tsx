"use client";

import Link from "next/link";
import "../css/mobile-nav.css";

export default function MobileNav({
  homeHref,
  dashboardHref,
}: {
  homeHref: string;
  dashboardHref: string;
}) {
  return (
    <nav className="mobile-bottom-nav">
      <Link href={homeHref} className="mobile-nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>Home</span>
      </Link>
      <Link href={dashboardHref} className="mobile-nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
        <span>Dashboard</span>
      </Link>
    </nav>
  );
}
