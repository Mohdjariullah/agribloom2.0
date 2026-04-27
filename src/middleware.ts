import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type Role = "admin" | "farmer";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/verifyemail",
]);

const PROTECTED_PREFIXES = [
  "/agrilens",
  "/chat",
  "/crops",
  "/insect",
  "/pests",
  "/fertilizer",
  "/mandi-prices",
  "/agri-prices",
  "/schemes",
  "/healthandbenefits",
  "/complete-profile",
  "/edit-profile",
  "/profile",
  "/contactus",
  "/soil",
  "/biofertilizers",
  "/farmingtechniques",
  "/trees",
  "/weather",
  "/logout",
  "/farmer",
  "/admin",
];

const ADMIN_PREFIXES = ["/admin"];
const FARMER_PREFIXES = ["/farmer"];

const SECRET = new TextEncoder().encode(
  process.env.TOKEN_SECRET || process.env.JWT_SECRET || ""
);

async function decode(token: string): Promise<{ id: string; role: Role } | null> {
  if (!token || !SECRET.length) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: String(payload.id ?? ""),
      role: (payload.role as Role) ?? "farmer",
    };
  } catch {
    return null;
  }
}

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value ?? "";

  const isPublic = PUBLIC_PATHS.has(path);
  const isProtected = startsWithAny(path, PROTECTED_PREFIXES);
  const decoded = token ? await decode(token) : null;
  const isLoggedIn = decoded !== null;

  // Logged-in users hitting auth pages → home
  if (isLoggedIn && (path === "/login" || path === "/signup" || path === "/verifyemail")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Anonymous users hitting protected routes → login
  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Role guards
  if (isLoggedIn && startsWithAny(path, ADMIN_PREFIXES) && decoded!.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isLoggedIn && startsWithAny(path, FARMER_PREFIXES) && decoded!.role !== "farmer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  if (isLoggedIn && (isProtected || isPublic)) {
    response.headers.set("Cache-Control", "no-store, must-revalidate");
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/verifyemail",
    "/logout",
    "/agrilens",
    "/chat",
    "/crops/:path*",
    "/insect",
    "/pests/:path*",
    "/fertilizer",
    "/mandi-prices",
    "/agri-prices",
    "/schemes/:path*",
    "/healthandbenefits",
    "/complete-profile",
    "/edit-profile",
    "/profile/:path*",
    "/contactus",
    "/soil",
    "/biofertilizers",
    "/farmingtechniques",
    "/trees",
    "/weather",
    "/farmer/:path*",
    "/admin/:path*",
  ],
};
