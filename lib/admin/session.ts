/**
 * Admin session cookie: "<expiresAt>.<hmac>".
 *
 * Built on Web Crypto rather than node:crypto so the same verify() runs in
 * middleware (edge runtime) and in route handlers (node runtime).
 */

export const ADMIN_COOKIE = 'nb_admin';
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) {
    throw new Error('ADMIN_SESSION_SECRET is not set. Add a long random string to .env.local.');
  }
  return value;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(payload: string): Promise<string> {
  const key = await hmacKey();
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

/** Constant-time compare so a wrong signature can't be probed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(now: number = Date.now()): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  now: number = Date.now()
): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt * 1000 > now;
}

/**
 * Compare a submitted password against ADMIN_PASSWORD without leaking length or
 * content through timing: both sides are hashed first, then compared in constant time.
 */
export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not set. Add it to .env.local.');
  }
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(candidate)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  return safeEqual(toHex(a), toHex(b));
}
