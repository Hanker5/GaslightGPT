/**
 * Mock Key-Value Store (In-Memory Redis/Vercel KV Mock)
 *
 * This is a learning implementation that mimics Redis/Vercel KV behavior.
 * It stores data in memory (a JavaScript Map) instead of a real database.
 *
 * Key concepts demonstrated:
 * - Key-value storage patterns
 * - TTL (Time To Live) / expiration handling
 * - Async API design (matches Vercel KV)
 * - Data serialization (JSON)
 *
 * Use this for local development, then switch to real Vercel KV for production.
 */

/**
 * Internal storage entry with expiration metadata
 */
interface StorageEntry<T> {
  /** The actual value stored */
  value: T
  /** Timestamp when this entry expires (Unix timestamp in ms) */
  expiresAt?: number
}

/**
 * Options for SET operations
 */
interface SetOptions {
  /** Expiration time in seconds (EX in Redis) */
  ex?: number
  /** Expiration time in milliseconds (PX in Redis) */
  px?: number
  /** Expiration timestamp in Unix seconds (EXAT in Redis) */
  exat?: number
  /** Expiration timestamp in Unix milliseconds (PXAT in Redis) */
  pxat?: number
}

/**
 * Mock KV class that implements Redis-like operations
 *
 * This class demonstrates how a key-value database works under the hood.
 * In production, you'd use `@vercel/kv` which connects to a real Redis instance.
 */
class MockKV {
  /**
   * The in-memory storage (this is our "database")
   * Map is perfect because:
   * - O(1) lookup (constant time, very fast)
   * - Maintains insertion order
   * - Can use any type as key (we use strings)
   */
  private store = new Map<string, StorageEntry<any>>()

  /**
   * Interval ID for the cleanup timer
   * We periodically remove expired entries to free memory
   */
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start a background process to clean up expired entries
    // This mimics how Redis handles expiration
    this.startCleanup()

    console.log('[MockKV] Initialized in-memory key-value store')
  }

  /**
   * SET - Store a value with optional expiration
   *
   * @param key - The key to store under (e.g., "share:abc123")
   * @param value - The value to store (any JSON-serializable data)
   * @param options - Optional expiration settings
   * @returns 'OK' on success (mimics Redis response)
   *
   * Examples:
   *   await kv.set('user:123', { name: 'Alice' })
   *   await kv.set('session:abc', data, { ex: 3600 })  // Expires in 1 hour
   */
  async set<T = any>(
    key: string,
    value: T,
    options?: SetOptions
  ): Promise<string> {
    // Calculate expiration timestamp if TTL provided
    let expiresAt: number | undefined

    if (options) {
      if (options.ex) {
        // EX: Expire in N seconds
        expiresAt = Date.now() + options.ex * 1000
      } else if (options.px) {
        // PX: Expire in N milliseconds
        expiresAt = Date.now() + options.px
      } else if (options.exat) {
        // EXAT: Expire at specific Unix timestamp (seconds)
        expiresAt = options.exat * 1000
      } else if (options.pxat) {
        // PXAT: Expire at specific Unix timestamp (milliseconds)
        expiresAt = options.pxat
      }
    }

    // Store the entry
    this.store.set(key, { value, expiresAt })

    // Log for debugging (helps you see what's happening)
    const expiryInfo = expiresAt
      ? `expires ${new Date(expiresAt).toISOString()}`
      : 'no expiration'
    console.log(`[MockKV] SET ${key} (${expiryInfo})`)

    return 'OK'
  }

  /**
   * GET - Retrieve a value by key
   *
   * @param key - The key to retrieve
   * @returns The value if found and not expired, null otherwise
   *
   * Examples:
   *   const user = await kv.get('user:123')
   *   if (user === null) { console.log('Not found or expired') }
   */
  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key)

    // Key doesn't exist
    if (!entry) {
      console.log(`[MockKV] GET ${key} → NOT FOUND`)
      return null
    }

    // Key exists but expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      console.log(`[MockKV] GET ${key} → EXPIRED`)
      // Clean up expired entry immediately
      this.store.delete(key)
      return null
    }

    console.log(`[MockKV] GET ${key} → FOUND`)
    return entry.value
  }

  /**
   * DEL - Delete one or more keys
   *
   * @param keys - Key(s) to delete
   * @returns Number of keys that were deleted
   *
   * Examples:
   *   await kv.del('user:123')
   *   await kv.del('user:123', 'user:456', 'user:789')
   */
  async del(...keys: string[]): Promise<number> {
    let deleted = 0

    for (const key of keys) {
      if (this.store.delete(key)) {
        deleted++
        console.log(`[MockKV] DEL ${key} → DELETED`)
      } else {
        console.log(`[MockKV] DEL ${key} → NOT FOUND`)
      }
    }

    return deleted
  }

  /**
   * EXISTS - Check if key(s) exist
   *
   * @param keys - Key(s) to check
   * @returns Number of keys that exist
   *
   * Examples:
   *   const exists = await kv.exists('user:123')  // 1 if exists, 0 if not
   */
  async exists(...keys: string[]): Promise<number> {
    let count = 0

    for (const key of keys) {
      const entry = this.store.get(key)

      // Check if exists AND not expired
      if (entry && (!entry.expiresAt || Date.now() <= entry.expiresAt)) {
        count++
      }
    }

    console.log(`[MockKV] EXISTS ${keys.join(', ')} → ${count}`)
    return count
  }

  /**
   * TTL - Get time-to-live for a key
   *
   * @param key - The key to check
   * @returns Seconds until expiration, -1 if no expiry, -2 if key doesn't exist
   *
   * This matches Redis TTL command behavior
   */
  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key)

    // Key doesn't exist
    if (!entry) {
      return -2
    }

    // Key exists but no expiration set
    if (!entry.expiresAt) {
      return -1
    }

    // Calculate remaining time in seconds
    const remainingMs = entry.expiresAt - Date.now()

    // Already expired
    if (remainingMs <= 0) {
      this.store.delete(key)
      return -2
    }

    return Math.ceil(remainingMs / 1000)
  }

  /**
   * KEYS - Get all keys matching a pattern (simplified version)
   *
   * WARNING: In production Redis, KEYS is dangerous for performance!
   * It blocks the entire server while scanning all keys.
   * Use SCAN instead in production.
   *
   * For our mock, it's fine since we have small datasets.
   *
   * @param pattern - Glob pattern (e.g., "share:*", "*:active")
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    const regex = this.globToRegex(pattern)
    const matchingKeys: string[] = []

    for (const [key, entry] of this.store.entries()) {
      // Skip expired entries
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        continue
      }

      if (regex.test(key)) {
        matchingKeys.push(key)
      }
    }

    console.log(`[MockKV] KEYS ${pattern} → ${matchingKeys.length} matches`)
    return matchingKeys
  }

  /**
   * Clear all data (useful for testing)
   * This doesn't exist in Redis - it's a mock-specific utility
   */
  async flushall(): Promise<void> {
    const count = this.store.size
    this.store.clear()
    console.log(`[MockKV] FLUSHALL → Cleared ${count} entries`)
  }

  /**
   * Background cleanup of expired entries
   *
   * This demonstrates how Redis handles expiration:
   * - Lazy deletion: When you GET, check if expired
   * - Active deletion: Periodically scan and remove expired keys
   *
   * We check every 60 seconds (configurable)
   */
  private startCleanup(): void {
    const CLEANUP_INTERVAL = 60 * 1000 // 1 minute

    this.cleanupInterval = setInterval(() => {
      let cleaned = 0
      const now = Date.now()

      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt && now > entry.expiresAt) {
          this.store.delete(key)
          cleaned++
        }
      }

      if (cleaned > 0) {
        console.log(`[MockKV] Cleanup: Removed ${cleaned} expired entries`)
      }
    }, CLEANUP_INTERVAL)

    // Prevent the interval from keeping Node.js alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Convert glob pattern to regex
   * Examples:
   *   "share:*" → /^share:.*$/
   *   "*:active" → /^.*:active$/
   *   "user:*:session" → /^user:.*:session$/
   */
  private globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // Escape regex special chars
      .replace(/\*/g, '.*')                   // * → .*
      .replace(/\?/g, '.')                    // ? → .

    return new RegExp(`^${escaped}$`)
  }

  /**
   * Get statistics about the mock database
   * Useful for debugging and learning
   */
  async stats(): Promise<{
    totalKeys: number
    expiredKeys: number
    activeKeys: number
  }> {
    let expiredKeys = 0
    const now = Date.now()

    for (const entry of this.store.values()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        expiredKeys++
      }
    }

    return {
      totalKeys: this.store.size,
      expiredKeys,
      activeKeys: this.store.size - expiredKeys
    }
  }
}

/**
 * Export singleton instance
 * This matches how @vercel/kv exports a pre-configured instance
 */
export const kv = new MockKV()

/**
 * Type exports for convenience
 */
export type { SetOptions }
