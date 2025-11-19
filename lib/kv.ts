/**
 * Key-Value Store Abstraction Layer
 *
 * This file provides a unified interface for key-value storage,
 * allowing seamless switching between:
 * - Mock KV (development) - In-memory storage
 * - Vercel KV (production) - Real Redis instance
 *
 * This is a common software engineering pattern called "Dependency Injection"
 * or "Strategy Pattern" - the implementation can change without changing
 * the calling code.
 *
 * Benefits:
 * 1. Develop without Vercel account
 * 2. Faster local development (no network calls)
 * 3. Easy testing (can clear mock data)
 * 4. Production-ready when deployed
 */

/**
 * Detect environment and import appropriate KV implementation
 *
 * Environment detection logic:
 * - If KV_REST_API_URL exists → Use real Vercel KV
 * - Otherwise → Use Mock KV
 *
 * This means:
 * - Local dev (no env vars) → Mock
 * - Vercel deployment (auto env vars) → Real KV
 */

// Check if Vercel KV credentials exist
const isVercelKV =
  typeof process !== 'undefined' &&
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_TOKEN

if (isVercelKV) {
  console.log('[KV] Using Vercel KV (production)')
} else {
  console.log('[KV] Using Mock KV (development)')
}

/**
 * Export the appropriate KV instance
 *
 * TypeScript will see this as having all the methods we use:
 * - set(key, value, options)
 * - get(key)
 * - del(...keys)
 * - exists(...keys)
 * - ttl(key)
 *
 * The actual implementation is hidden - calling code doesn't care!
 */

// For now, we'll always use Mock KV
// Later, when you add Vercel KV credentials, uncomment the real import
export { kv } from './kv-mock'

// When ready for production, replace with:
/*
import { kv as vercelKV } from '@vercel/kv'
import { kv as mockKV } from './kv-mock'

export const kv = isVercelKV ? vercelKV : mockKV
*/

/**
 * Re-export types for convenience
 */
export type { SetOptions } from './kv-mock'
