"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import royalRumbleLogo from "../assets/logo.png";
import "../css/about.css";

export default function LogoButton() {

  const router = useRouter();
  const pathname = usePathname();

    const handleLogoClick = () => {
    if (pathname.startsWith("/freshmen")) {
      router.push("/freshmen/home");  
    } else if (pathname.startsWith("/mentor/ambassador")) {
      router.push("/mentor/ambassador");

    } else if (pathname.startsWith("/mentor/hallway_host")) {
      router.push("/mentor/hallway_host");

    } else if (pathname.startsWith("/mentor/utility_squad")) {
      router.push("/mentor/utility_squad");

    } else if (pathname.startsWith("/admin")) {
      router.push("/admin");

    } else {
      router.push("/");
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
