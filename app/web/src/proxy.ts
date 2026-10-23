import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const auth = NextAuth(authConfig).auth;

export const proxy = auth;
export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
