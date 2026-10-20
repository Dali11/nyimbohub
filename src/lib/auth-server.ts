import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  throw new Error("NEON_AUTH_URL is not configured");
}

if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error("NEON_AUTH_COOKIE_SECRET must be configured and at least 32 characters long");
}

/**
 * Server-side Neon Auth instance.
 * Use this from server components, route handlers, and server actions only.
 */
export const authServer = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
});
