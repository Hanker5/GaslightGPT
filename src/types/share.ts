import { Conversation } from './chat'

/**
 * Request payload for creating a shared chat
 */
export interface ShareRequest {
  /** The conversation to share */
  conversation: Conversation
}

/**
 * Successful response from share creation API
 */
export interface ShareResponse {
  /** Unique identifier for the share */
  shareId: string
  /** Full URL to access the shared chat */
  url: string
  /** Timestamp when the share will expire (Unix timestamp) */
  expiresAt: number
}

/**
 * Data structure stored in the database for a shared chat
 * This is what we store in Vercel KV (or Mock KV)
 */
export interface SharedConversation {
  /** The shared conversation data */
  conversation: Conversation
  /** Timestamp when the share was created (Unix timestamp) */
  sharedAt: number
  /** Timestamp when the share will expire (Unix timestamp) */
  expiresAt: number
}

/**
 * Error response from share API
 */
export interface ShareError {
  /** Error message */
  error: string
  /** Optional error details */
  details?: string
}

/**
 * Type guard to check if response is a share error
 * @param response - The response to check
 * @returns true if the response is a ShareError
 */
export function isShareError(
  response: ShareResponse | ShareError
): response is ShareError {
  return 'error' in response
}
