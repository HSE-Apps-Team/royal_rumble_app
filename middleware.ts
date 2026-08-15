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
  const userJob = user?.job?.trim().toUpperCase();

  const isLoggedIn = !!user;

  if (path.startsWith("/admin")) {
    if (!isLoggedIn || userJob !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (path.startsWith("/mentor")) {
    // Coarse gate only: any logged-in, registered non-admin user may pass.
    // Precise job -> route validation happens in the page itself (DB-backed
    // job catalog), since middleware can't do an async DB lookup per request.
    if (!isLoggedIn || !userJob || userJob === "ADMIN" || userJob === "UNREGISTERED") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
}

export default isDevMode ? devMiddleware : auth(prodMiddleware);