/**
 * CSRF protection utilities for SentraOps.
 *
 * Provides an additional defence layer on top of Supabase SSR's built-in
 * SameSite=Lax cookie protection.  Intended for state-changing API routes
 * (financial mutations, invoice creation, etc.).
 *
 * All functions use the Web Crypto API only — zero external dependencies.
 *
 * @example
 * ```ts
 * import { csrfMiddleware } from '@/lib/csrf'
 *
 * export async function POST(request: Request) {
 *   const result = csrfMiddleware(request, () => {
 *     // Retrieve the stored token from session / cookie (your lookup logic)
 *     return request.headers.get('x-csrf-token')
 *   })
 *
 *   if (!result.success) {
 *     return NextResponse.json({ error: result.error }, { status: 403 })
 *   }
 *
 *   // … handle request
 * }
 * ```
 */

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

/** Header name used to transmit the CSRF token on mutating requests. */
export const TOKEN_HEADER = 'x-csrf-token'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface CsrfToken {
  /** The cryptographically random token value. */
  token: string
  /** Epoch ms at which this token expires and should be replaced. */
  expiresAt: number
}

export interface CsrfValidationResult {
  /** Whether the token passed validation. */
  success: boolean
  /** Human-readable error message when `success` is `false`. */
  error?: string
}

/* ------------------------------------------------------------------ */
/*  Token generation                                                  */
/* ------------------------------------------------------------------ */

/**
 * Generates a cryptographically random CSRF token.
 *
 * Uses `crypto.randomUUID()` where available (modern browsers, Edge
 * runtime, Node.js 19+); falls back to `crypto.getRandomValues()` with
 * hex encoding for older environments.
 */
export function generateCsrfToken(): string {
  // Prefer randomUUID — available in all modern runtimes (browser, Edge,
  // Node 19+). It returns a UUID v4 string like
  // "550e8400-e29b-41d4-a716-446655440000".
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback: generate 32 random bytes and hex-encode them.
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/* ------------------------------------------------------------------ */
/*  Constant-time comparison                                          */
/* ------------------------------------------------------------------ */

/**
 * Compares two strings in constant time to prevent timing attacks.
 *
 * Uses a bitwise-XOR loop that runs in O(n) regardless of match position,
 * making it resistant to timing side-channel attacks.
 *
 * The implementation works in any JavaScript runtime (browser, Edge,
 * Node.js) without relying on platform-specific APIs.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Different-length strings can never match.  Return early so callers
  // see a clear `false`; the length mismatch is already observable via
  // other channels (response size, etc.).
  if (a.length !== b.length) {
    return false
  }

  // Constant-time XOR comparison: every byte is always compared,
  // so an attacker cannot determine which byte position differs.
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */

/**
 * Validates a CSRF token against a stored value using constant-time
 * comparison.
 *
 * @param token       The token received from the client (e.g. from header).
 * @param storedToken The token previously stored on the server/session.
 * @returns `true` when both tokens match.
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false
  return timingSafeEqual(token, storedToken)
}

/* ------------------------------------------------------------------ */
/*  Middleware helper                                                  */
/* ------------------------------------------------------------------ */

/**
 * Middleware-style CSRF check for API route handlers.
 *
 * - Skips validation for safe methods: GET, HEAD, OPTIONS.
 * - Reads the token from the `x-csrf-token` request header.
 * - Calls `getStoredToken()` to retrieve the expected token value.
 *
 * @example
 * ```ts
 * const result = csrfMiddleware(request, () => session.csrfToken)
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: 403 })
 * }
 * ```
 *
 * @param request       The incoming `Request` object.
 * @param getStoredToken Callback that returns the stored CSRF token or
 *                       `null` if none is available.
 * @returns A `CsrfValidationResult` indicating success or failure.
 */
export function csrfMiddleware(
  request: Request,
  getStoredToken: () => string | null,
): CsrfValidationResult {
  // Safe methods: no CSRF check needed.
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { success: true }
  }

  const storedToken = getStoredToken()

  // No stored token — can't validate.
  if (!storedToken) {
    return { success: false, error: 'Invalid CSRF token' }
  }

  const headerToken = request.headers.get(TOKEN_HEADER)

  if (!headerToken) {
    return { success: false, error: 'Invalid CSRF token' }
  }

  if (!validateCsrfToken(headerToken, storedToken)) {
    return { success: false, error: 'Invalid CSRF token' }
  }

  return { success: true }
}
