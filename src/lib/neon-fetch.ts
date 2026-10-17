import "server-only";

import https from "node:https";

const NEON_API_HOST = "api.c-6.eu-central-1.aws.neon.tech";

/*
 * Node's native fetch is currently timing out when connecting to
 * Neon's API hostname in this environment.
 *
 * Keep the working IPv4 as the transport address while preserving
 * the Neon hostname for TLS/SNI and the Host header.
 */
const NEON_API_IPS = [
  "52.28.178.228",
  "63.186.215.67",
  "3.126.61.52",
];

export async function neonFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input.toString());

  if (url.hostname !== NEON_API_HOST) {
    return globalThis.fetch(input, init);
  }

  const headers = new Headers(init?.headers);

  let lastError: unknown;

  for (const ip of NEON_API_IPS) {
    try {
      return await requestNeon(ip, url, init, headers);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to connect to Neon API (${NEON_API_HOST}). ` +
      `Tried ${NEON_API_IPS.length} IPv4 addresses.`,
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
