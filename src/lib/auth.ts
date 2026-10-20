import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

// Neon Auth's client requires an absolute URL. In the browser, use the
// current origin so local, preview, and production deployments use their own
// same-origin auth proxy. The server-side fallback is only for module setup.
const appOrigin =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const authBaseUrl = new URL("/api/auth", appOrigin).toString();

export const auth = createAuthClient(authBaseUrl, {
  adapter: BetterAuthReactAdapter(),
});
