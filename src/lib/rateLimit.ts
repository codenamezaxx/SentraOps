/**
 * In-memory rate limiter for API route protection.
 *
 * Tracks request counts per key (typically IP address) within a sliding
 * window. Each `RateLimiter` instance maintains independent state, so
 * separate limiters can be used for different endpoints (e.g. auth vs. API).
 *
 * @example
 * ```ts
 * import { RateLimiter, rateLimit } from '@/lib/rateLimit'
 *
 * // Use the default shared limiter (30 req/min)
 * const result = rateLimit(clientIp)
 *
 * // Or create a dedicated limiter for auth endpoints
 * const authLimiter = new RateLimiter({ windowMs: 300_000, maxRequests: 5 })
 * const result = authLimiter.check(clientIp)
 *
 * if (!result.success) {
 *   return NextResponse.json({ error: 'Too Many Requests' }, {
 *     status: 429,
 *     headers: { 'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)) }
 *   })
 * }
 * ```
 */

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60 000 = 1 minute) */
  windowMs?: number
  /** Maximum number of requests allowed within the window (default: 30) */
  maxRequests?: number
}

export interface RateLimitResult {
  /** Whether the request is allowed under the current limit */
  success: boolean
  /** Remaining requests in the current window */
  remaining: number
  /** Timestamp (epoch ms) when the current window resets */
  resetTime: number
}

/* ------------------------------------------------------------------ */
/*  Internal entry shape                                              */
/* ------------------------------------------------------------------ */

interface RateLimitEntry {
  count: number
  resetTime: number
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_MAX_REQUESTS = 30

/* ------------------------------------------------------------------ */
/*  RateLimiter class                                                  */
/* ------------------------------------------------------------------ */

export class RateLimiter {
  private readonly windowMs: number
  private readonly maxRequests: number
  private readonly store = new Map<string, RateLimitEntry>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  /**
   * @param options  Configuration for window size and request limit.
   */
  constructor(options?: RateLimiterOptions) {
    this.windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS
    this.maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS
    this.startCleanup()
  }

  /**
   * Check whether `key` is allowed to make a request.
   *
   * - Creates a new window if none exists or the current one has expired.
   * - Increments the counter for existing windows.
   * - Returns `success: false` when the limit has been exceeded.
   */
  check(key: string): RateLimitResult {
    const now = Date.now()
    const entry = this.store.get(key)

    // First request or window has expired — start a new window
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.windowMs
      this.store.set(key, { count: 1, resetTime })
      return { success: true, remaining: this.maxRequests - 1, resetTime }
    }

    // Existing window — increment the counter
    entry.count++

    if (entry.count > this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Remove all tracked entries. Useful for testing or resetting state.
   */
  reset(): void {
    this.store.clear()
  }

  /**
   * Stop the internal cleanup timer and release all state.
   *
   * Call this when the limiter is no longer needed (e.g. during test
   * teardown) so the Node.js process can exit cleanly.
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.store.clear()
  }

  /** Number of entries currently tracked (for diagnostics). */
  get size(): number {
    return this.store.size
  }

  // ---------------------------------------------------------------
  //  Private: periodic stale-entry cleanup
  // ---------------------------------------------------------------

  private startCleanup(): void {
    if (this.cleanupTimer) return

    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store) {
        if (now >= entry.resetTime) {
          this.store.delete(key)
        }
      }
    }, this.windowMs)

    // Allow the Node.js event loop to exit even if this timer is active.
    if (
      this.cleanupTimer &&
      typeof this.cleanupTimer === 'object' &&
      'unref' in this.cleanupTimer
    ) {
      this.cleanupTimer.unref()
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton default instance + convenience helpers                  */
/* ------------------------------------------------------------------ */

const defaultLimiter = new RateLimiter()

/**
 * Convenience wrapper around the default shared `RateLimiter` instance.
 *
 * Designed for use inside Next.js API route handlers.  Create dedicated
 * limiters (via `new RateLimiter(...)`) for endpoints with different
 * sensitivity (e.g. login, checkout).
 *
 * @example
 * ```ts
 * import { NextResponse } from 'next/server'
 * import { rateLimitMiddleware } from '@/lib/rateLimit'
 *
 * export async function POST(request: Request) {
 *   const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
 *   const result = rateLimitMiddleware(ip)
 *
 *   if (!result.success) {
 *     return NextResponse.json(
 *       { error: 'Too Many Requests' },
 *       {
 *         status: 429,
 *         headers: {
 *           'Retry-After': String(
 *             Math.ceil((result.resetTime - Date.now()) / 1000),
 *           ),
 *         },
 *       },
 *     )
 *   }
 *
 *   // ... handle request
 * }
 * ```
 */
export function rateLimitMiddleware(
  key: string,
  limiter?: RateLimiter,
): RateLimitResult {
  return (limiter ?? defaultLimiter).check(key)
}

/**
 * Alias for `rateLimitMiddleware`.
 *
 * Provided so the common import pattern `import { rateLimit } from '@/lib/rateLimit'`
 * works out of the box.
 */
export const rateLimit = rateLimitMiddleware
