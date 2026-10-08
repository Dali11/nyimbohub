import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const authUrl = process.env.NEON_AUTH_URL;

if (!authUrl) {
  throw new Error("NEON_AUTH_URL is not configured");
}

export const auth = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});
