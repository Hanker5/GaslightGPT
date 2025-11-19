/**
 * SharedChatView Component
 *
 * Displays a read-only view of a shared chat conversation.
 * This component is shown when users visit /share/:shareId URLs.
 *
 * Key features:
 * - Fetches shared conversation from API
 * - Read-only mode (no input box, no editing)
 * - Shows share metadata (shared date, expiration)
 * - Loading and error states
 * - Responsive design
 *
 * Learning concepts:
 * - useParams hook (extracting URL parameters)
 * - useEffect for data fetching
 * - Loading/error/success states
 * - Conditional rendering
 * - Read-only UI patterns
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSharedChat, isApiError } from '@/lib/shareApi'
import type { SharedConversation } from '@/types'
import ChatMessage from './ChatMessage'
import Logo from './Logo'
import { Loader2 } from 'lucide-react'

/**
 * Loading component shown while fetching shared chat
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading shared chat...</p>
    </div>
  )
}

/**
 * Error component shown when share not found or failed to load
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Unable to Load Share</h1>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to GaslightGPT
      </Link>
    </div>
  )
}

/**
 * Header for shared chat view
 * Shows logo, title, and share metadata
 */
function SharedChatHeader({
  title,
  sharedAt,
  expiresAt
}: {
  title: string
  sharedAt: number
  expiresAt: number
}) {
  const sharedDate = new Date(sharedAt).toLocaleDateString()
  const expiresDate = new Date(expiresAt).toLocaleDateString()
  const daysUntilExpiration = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Logo and Link */}
        <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit">
          <Logo className="w-8 h-8" />
          <span className="font-semibold text-lg">GaslightGPT</span>
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">{title}</h1>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Shared on {sharedDate}</span>
          <span>•</span>
          <span>
            Expires {expiresDate}
            {daysUntilExpiration > 0 && daysUntilExpiration <= 7 && (
              <span className="text-orange-500 ml-1">
                ({daysUntilExpiration} {daysUntilExpiration === 1 ? 'day' : 'days'} left)
              </span>
            )}
          </span>
        </div>

        {/* Read-only badge */}
        <div className="mt-3 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
          Read-only view
        </div>
      </div>
    </div>
  )
}

/**
 * Main SharedChatView Component
 *
 * Lifecycle:
 * 1. Extract shareId from URL using useParams()
 * 2. Fetch shared conversation on mount
 * 3. Show loading state while fetching
 * 4. Show error state if fetch fails
 * 5. Show conversation if successful
 */
export function SharedChatView() {
  // ===== URL PARAMETER EXTRACTION =====
  // useParams() hook from React Router
  // Extracts :shareId from /share/:shareId URL
  const { shareId } = useParams<{ shareId: string }>()

  // ===== COMPONENT STATE =====
  const [data, setData] = useState<SharedConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== FETCH SHARED CHAT ON MOUNT =====
  useEffect(() => {
    // Validate shareId exists
    if (!shareId) {
      setError('Invalid share link')
      setLoading(false)
      return
    }

    // Fetch shared conversation from API
    async function fetchSharedChat() {
      try {
        console.log(`[SharedChatView] Fetching share: ${shareId}`)
        const sharedConversation = await getSharedChat(shareId)
        setData(sharedConversation)
        setError(null)

        // Update page title with conversation title
        document.title = `${sharedConversation.conversation.title} - GaslightGPT`
      } catch (err) {
        console.error('[SharedChatView] Error fetching share:', err)

        // Handle different error types
        if (isApiError(err)) {
          if (err.status === 404) {
            setError('This share link has expired or does not exist.')
          } else if (err.status === 400) {
            setError('Invalid share link format.')
          } else {
            setError(err.message || 'Failed to load shared chat.')
          }
        } else {
          setError('Network error. Please check your connection and try again.')
        }

        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSharedChat()

    // Cleanup: Reset page title when component unmounts
    return () => {
      document.title = 'GaslightGPT'
    }
  }, [shareId]) // Re-run if shareId changes

  // ===== CONDITIONAL RENDERING =====
  // Show different UI based on state

  if (loading) {
    return <LoadingState />
  }

  if (error || !data) {
    return <ErrorState message={error || 'Unknown error occurred'} />
  }

  const { conversation, sharedAt, expiresAt } = data

  // ===== SUCCESS STATE: RENDER CONVERSATION =====
  return (
    <div className="flex flex-col h-screen">
      {/* Header with metadata */}
      <SharedChatHeader
        title={conversation.title}
        sharedAt={sharedAt}
        expiresAt={expiresAt}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {conversation.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onEdit={() => {}} // No-op: Read-only mode
              showGaslitLabel={true}
              isReadOnly={true} // Tell ChatMessage it's read-only
            />
          ))}

          {/* Empty state */}
          {conversation.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              This conversation has no messages.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          This is a shared chat from{' '}
          <Link to="/" className="text-primary hover:underline">
            GaslightGPT
          </Link>
          . Create your own chats at gaslightgpt.com
        </div>
      </div>
    </div>
  )
}

export default SharedChatView
