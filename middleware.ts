import { auth } from "@/auth";
import { NextResponse } from "next/server";

const isDevMode = process.env.DEV_MODE === "true";

function devMiddleware() {
  return NextResponse.next();
}

function prodMiddleware(req: any) {
  const { nextUrl } = req;
  const session = req.auth;

  const path = nextUrl.pathname;
  const user = session?.user;

  const isLoggedIn = !!user;

  if (path.startsWith("/admin")) {
    if (!isLoggedIn || user.job !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (path.startsWith("/freshmen")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (user.job === "UNREGISTERED" && path !== "/freshmen/home") {
      return NextResponse.redirect(new URL("/freshmen/home", nextUrl));
    }
    if (user.job !== "FRESHMAN" && user.job !== "UNREGISTERED") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (path.startsWith("/mentor")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    const allowedMentorJobs = [
      "AMBASSADOR",
      "HALLWAY HOST",
      "UTILITY SQUAD",
      "CCA CONVOS",
    ];

    if (!allowedMentorJobs.includes(user.job ?? "")) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
}

export default isDevMode ? devMiddleware : auth(prodMiddleware);