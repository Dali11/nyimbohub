import "server-only";

import https from "node:https";
import dns from "node:dns";

const NEON_API_HOST = "api.c-6.eu-central-1.aws.neon.tech";

// Only enabled via the NEON_IPV4_WORKAROUND flag. Default is OFF, so in
// production fetch connects directly to NEON_API_HOST with no hardcoded IPs.
const NEON_IPV4_WORKAROUND = process.env.NEON_IPV4_WORKAROUND === "1";

const NEON_API_IPS = [
  "52.28.178.228",
  "63.186.215.67",
  "3.126.61.52",
];

// Short-lived cache for resolution results so we don't hit DNS on every
// request, but the list is refreshed after the TTL.
let cachedNeonIps: string[] | null = null;
const IPV4_CACHE_TTL_MS = 60_000;

async function resolveNeonIps(): Promise<string[]> {
  if (cachedNeonIps) return cachedNeonIps;

  try {
    const ips = await dns.promises.resolve4(NEON_API_HOST);
    if (ips.length > 0) {
      cachedNeonIps = ips;
      setTimeout(() => {
        cachedNeonIps = null;
      }, IPV4_CACHE_TTL_MS);
      return ips;
    }
  } catch {
    // DNS resolution failed; fall through to the static list below.
  }

  return NEON_API_IPS;
}

export async function neonFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input.toString());

  if (url.hostname !== NEON_API_HOST) {
    return globalThis.fetch(input, init);
  }

  if (!NEON_IPV4_WORKAROUND) {
    // Default: production uses the normal fetch with no hardcoded IPs.
    return globalThis.fetch(input, init);
  }

  const ips = await resolveNeonIps();

  const headers = new Headers(init?.headers);
  let lastError: unknown;

  for (const ip of ips) {
    try {
      return await requestNeon(ip, url, init, headers);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to connect to Neon API (${NEON_API_HOST}). ` +
      `Tried ${ips.length} IPv4 addresses.`,
    { cause: lastError },
  );
}

function requestNeon(
  ip: string,
  url: URL,
  init: RequestInit | undefined,
  headers: Headers,
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const req = https.request(
      {
        protocol: "https:",
        hostname: ip,
        port: 443,
        method: init?.method ?? "GET",
        path: `${url.pathname}${url.search}`,

        // Keep the real Neon hostname for TLS/SNI.
        servername: NEON_API_HOST,

        headers: {
          ...Object.fromEntries(headers.entries()),

          // Keep the real Neon hostname for HTTP routing.
          host: NEON_API_HOST,
        },

        rejectUnauthorized: true,
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk));
        });

        res.on("end", () => {
          const body = Buffer.concat(chunks);
          const responseHeaders = new Headers();

          for (const [key, value] of Object.entries(res.headers)) {
            if (value === undefined) continue;

            if (Array.isArray(value)) {
              for (const item of value) {
                responseHeaders.append(key, item);
              }
            } else {
              responseHeaders.set(key, value);
            }
          }

          resolve(
            new Response(body, {
              status: res.statusCode ?? 500,
              statusText: res.statusMessage ?? "",
              headers: responseHeaders,
            }),
          );
        });

        res.on("error", reject);
      },
    );

    req.on("error", reject);

    if (typeof init?.body === "string") {
      req.write(init.body);
    } else if (init?.body instanceof Uint8Array) {
      req.write(init.body);
    } else if (init?.body != null) {
      reject(
        new Error(
          `Unsupported Neon request body type: ${typeof init.body}`,
        ),
      );
      req.destroy();
      return;
    }

    req.end();
  });
}
