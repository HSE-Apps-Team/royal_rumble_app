"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import royalRumbleLogo from "../assets/logo.png";
import "../css/about.css";

export default function LogoButton() {

  const router = useRouter();
  const pathname = usePathname();

    const handleLogoClick = () => {
    if (pathname.startsWith("/admin")) {
      router.push("/admin");

    } else {
      const mentorMatch = pathname.match(/^\/mentor\/[^/]+/);
      router.push(mentorMatch ? mentorMatch[0] : "/");
    }
  };

  return (
    <button className="home-logo-button" onClick={handleLogoClick}>
      <Image
        src={royalRumbleLogo}
        alt="Royal Rumble Logo"
        className="logo"
      />
    </button>
  );
}
