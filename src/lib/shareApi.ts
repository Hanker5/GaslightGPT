/**
 * Share API Client
 *
 * This module provides type-safe functions for interacting with the share API.
 * It handles HTTP communication, error handling, and response parsing.
 *
 * Key concepts demonstrated:
 * - Fetch API for HTTP requests
 * - Async/await for asynchronous operations
 * - Error handling with try/catch
 * - Type guards for response validation
 * - Environment-aware API URLs
 *
 * Architecture pattern: API Client / Repository Pattern
 * - Encapsulates HTTP logic away from UI components
 * - Provides clean, type-safe interface
 * - Centralizes error handling
 */

import type {
  Conversation,
  ShareRequest,
  ShareResponse,
  ShareError,
  SharedConversation,
  isShareError
} from '@/types'

/**
 * Base URL for API requests
 *
 * Environment detection:
 * - Development: Vite dev server (5173) calls Express API (3001)
 * - Production: Same origin (Vercel serves both frontend and API)
 * - Node.js tests: Direct API server URL
 *
 * In development, Vite proxies /api/* to localhost:3001 (see vite.config.js)
 * In production, /api/* is handled by Vercel Serverless Functions
 *
 * Why this works:
 * - import.meta.env.DEV exists in Vite (browser) → true in dev, false in prod
 * - In Node.js (tests), import.meta.env is undefined → fallback to localhost
 * - In production build, import.meta.env.DEV is false → empty string (same origin)
 */
const API_BASE_URL =
  // Check if we're in Vite context
  typeof import.meta.env !== 'undefined' && import.meta.env.DEV
    ? 'http://localhost:3001'  // Vite dev mode: Direct API server
    : typeof import.meta.env !== 'undefined' && !import.meta.env.DEV
    ? ''                         // Vite production: Same origin (relative URLs)
    : 'http://localhost:3001'    // Node.js context (tests): Direct API server

/**
 * Custom error class for API errors
 *
 * Extends the built-in Error class to include:
 * - HTTP status code
 * - Error response from server
 * - Original fetch Response object
 *
 * This provides rich error information for debugging and user feedback.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: ShareError,
    public originalResponse?: Response
  ) {
    super(message)
    this.name = 'ApiError'

    // Maintain proper stack trace (only available in V8 engines like Chrome/Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

/**
 * Create a shared chat
 *
 * This function:
 * 1. Sends the conversation to the backend
 * 2. Backend generates a UUID and stores in database
 * 3. Returns share metadata (shareId, URL, expiration)
 *
 * @param conversation - The conversation to share
 * @returns Promise resolving to share metadata
 * @throws {ApiError} If request fails or server returns error
 *
 * @example
 * try {
 *   const { shareId, url, expiresAt } = await createShare(conversation)
 *   console.log(`Share created: ${url}`)
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`Failed (${error.status}): ${error.message}`)
 *   }
 * }
 */
export async function createShare(
  conversation: Conversation
): Promise<ShareResponse> {
  console.log('[shareApi] Creating share for conversation:', conversation.id)

  try {
    // ===== PREPARE REQUEST =====
    const requestBody: ShareRequest = { conversation }

    // ===== SEND HTTP REQUEST =====
    // POST /api/share
    // - Method: POST (creating new resource)
    // - Headers: Tell server we're sending JSON
    // - Body: Conversation data as JSON string
    const response = await fetch(`${API_BASE_URL}/api/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Could add auth headers here in the future:
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`[shareApi] Response status: ${response.status}`)

    // ===== PARSE RESPONSE BODY =====
    // response.json() parses the JSON body
    // It returns a Promise, so we await it
    const data = await response.json() as ShareResponse | ShareError

    // ===== ERROR HANDLING =====
    // Check if response indicates an error
    // Two ways to detect errors:
    // 1. HTTP status code (response.ok is false for 4xx/5xx)
    // 2. Response body has 'error' field (type guard)

    if (!response.ok) {
      // Server returned 4xx or 5xx status
      console.error('[shareApi] Server error:', data)

      // Type guard: check if response is ShareError
      const errorMessage = 'error' in data
        ? data.error
        : 'Failed to create share'

      throw new ApiError(
        errorMessage,
        response.status,
        'error' in data ? data : undefined,
        response
      )
    }

    // ===== SUCCESS =====
    console.log('[shareApi] Share created successfully:', data)
    return data as ShareResponse

  } catch (error) {
    // ===== HANDLE NETWORK ERRORS =====
    // fetch() throws for network failures (no internet, DNS issues, etc.)
    // It does NOT throw for HTTP errors (404, 500, etc.) - those return responses

    if (error instanceof ApiError) {
      // Already an ApiError, just re-throw
      throw error
    }

    // Network error or other unexpected error
    console.error('[shareApi] Network error:', error)

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0, // 0 indicates network failure (no HTTP status)
      undefined,
      undefined
    )
  }
}

/**
 * Retrieve a shared chat by ID
 *
 * This function:
 * 1. Requests the shared conversation from backend
 * 2. Backend looks up in database (Mock KV)
 * 3. Returns conversation with metadata, or 404 if not found
 *
 * @param shareId - The UUID of the share
 * @returns Promise resolving to shared conversation
 * @throws {ApiError} If share not found or request fails
 *
 * Common error scenarios:
 * - 404: Share doesn't exist or expired
 * - 400: Invalid share ID format
 * - 500: Server error
 * - 0: Network failure
 *
 * @example
 * try {
 *   const { conversation, sharedAt, expiresAt } = await getSharedChat(shareId)
 *   console.log(`Retrieved: ${conversation.title}`)
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 404) {
 *     console.log('Share not found or expired')
 *   }
 * }
 */
export async function getSharedChat(
  shareId: string
): Promise<SharedConversation> {
  console.log(`[shareApi] Fetching shared chat: ${shareId}`)

  try {
    // ===== SEND HTTP REQUEST =====
    // GET /api/share/:shareId
    // - Method: GET (reading resource)
    // - No body needed (GET requests don't have bodies)
    // - ShareId in URL path
    const response = await fetch(`${API_BASE_URL}/api/share/${shareId}`)

    console.log(`[shareApi] Response status: ${response.status}`)

    // ===== PARSE RESPONSE BODY =====
    const data = await response.json() as SharedConversation | ShareError

    // ===== ERROR HANDLING =====
    if (!response.ok) {
      console.error('[shareApi] Server error:', data)

      // Provide user-friendly error messages based on status
      let errorMessage = 'Failed to retrieve share'

      if (response.status === 404) {
        errorMessage = 'Share not found or has expired'
      } else if (response.status === 400) {
        errorMessage = 'Invalid share ID'
      } else if ('error' in data) {
        errorMessage = data.error
      }

      throw new ApiError(
        errorMessage,
        response.status,
        'error' in data ? data : undefined,
        response
      )
    }

    // ===== SUCCESS =====
    console.log('[shareApi] Share retrieved successfully')
    console.log(`  - Title: ${(data as SharedConversation).conversation.title}`)
    console.log(`  - Messages: ${(data as SharedConversation).conversation.messages.length}`)

    return data as SharedConversation

  } catch (error) {
    // ===== HANDLE NETWORK ERRORS =====
    if (error instanceof ApiError) {
      throw error
    }

    console.error('[shareApi] Network error:', error)

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      undefined,
      undefined
    )
  }
}

/**
 * Helper function to check if an error is an ApiError
 *
 * TypeScript type guard for error handling in components
 *
 * @example
 * try {
 *   await createShare(conversation)
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.log(`Status: ${error.status}`)
 *   }
 * }
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * ============================================================
 * USAGE EXAMPLES (for reference)
 * ============================================================
 *
 * Example 1: Creating a share in a React component
 *
 * import { createShare } from '@/lib/shareApi'
 *
 * function ShareButton({ conversation }) {
 *   const [loading, setLoading] = useState(false)
 *
 *   const handleShare = async () => {
 *     setLoading(true)
 *     try {
 *       const { url } = await createShare(conversation)
 *       navigator.clipboard.writeText(url)
 *       toast.success('Share link copied!')
 *     } catch (error) {
 *       if (isApiError(error)) {
 *         toast.error(error.message)
 *       }
 *     } finally {
 *       setLoading(false)
 *     }
 *   }
 *
 *   return <button onClick={handleShare} disabled={loading}>Share</button>
 * }
 *
 * ============================================================
 *
 * Example 2: Retrieving a share on page load
 *
 * import { getSharedChat } from '@/lib/shareApi'
 *
 * function SharedChatView({ shareId }) {
 *   const [data, setData] = useState(null)
 *   const [error, setError] = useState(null)
 *
 *   useEffect(() => {
 *     getSharedChat(shareId)
 *       .then(setData)
 *       .catch(error => {
 *         if (isApiError(error) && error.status === 404) {
 *           setError('Share not found')
 *         } else {
 *           setError('Failed to load share')
 *         }
 *       })
 *   }, [shareId])
 *
 *   if (error) return <div>Error: {error}</div>
 *   if (!data) return <div>Loading...</div>
 *   return <ChatDisplay conversation={data.conversation} />
 * }
 */
