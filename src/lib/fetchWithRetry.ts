/**
 * Network retry utility with exponential backoff + jitter.
 * Retries failed fetch/API calls for transient errors.
 */

interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in ms between retries (default: 1000) */
  baseDelay?: number
  /** Maximum delay cap in ms (default: 10000) */
  maxDelay?: number
  /** HTTP status codes that should NOT be retried (default: 4xx except 429) */
  nonRetryableStatuses?: number[]
  /** Optional callback on each retry attempt */
  onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  nonRetryableStatuses: [400, 401, 403, 404, 422],
}

/**
 * Calculate delay with exponential backoff and full jitter.
 * Formula: random_between(0, min(cap, base * 2^attempt))
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt))
  return Math.random() * exponential
}

/**
 * Determine if a response status should be retried.
 * Retry on: 5xx, 429 (rate limited), network errors
 * Don't retry on: 4xx (except 429)
 */
function isRetryableStatus(status: number, nonRetryableStatuses: number[]): boolean {
  if (status === 429) return true // rate-limited, retry with backoff
  if (status >= 500) return true // server errors, retry
  return !nonRetryableStatuses.includes(status)
}

/**
 * Wraps fetch with automatic retry on transient failures.
 * Only retries network errors, 5xx responses, and 429 rate limits.
 * Returns the first successful response or throws after exhausting retries.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries,
    baseDelay,
    maxDelay,
    nonRetryableStatuses,
    onRetry,
  } = { ...DEFAULT_OPTIONS, ...options }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init)

      if (response.ok) return response

      if (!isRetryableStatus(response.status, nonRetryableStatuses)) {
        return response // non-retryable status, return as-is
      }

      // Retryable status — fall through to retry logic
      if (attempt < maxRetries) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        const delay = calculateDelay(attempt, baseDelay, maxDelay)
        onRetry?.(attempt + 1, lastError)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        return response // last attempt, return response even if error
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Network request failed")

      if (attempt < maxRetries) {
        const delay = calculateDelay(attempt, baseDelay, maxDelay)
        onRetry?.(attempt + 1, lastError)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError ?? new Error("Request failed after retries")
}

/**
 * Typed version of fetchWithRetry that parses JSON response.
 * Throws on non-ok responses after exhausting retries.
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(input, init, options)

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`HTTP ${response.status}: ${response.statusText}${body ? ` — ${body}` : ""}`)
  }

  return response.json() as Promise<T>
}
