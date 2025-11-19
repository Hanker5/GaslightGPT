/**
 * ShareDialog Component
 *
 * Modal dialog that handles the share creation flow:
 * 1. User triggers share
 * 2. Shows loading state while creating
 * 3. Displays shareable URL on success
 * 4. Shows error message on failure
 *
 * Learning concepts:
 * - Dialog/Modal pattern with Radix UI
 * - State machine pattern (idle → loading → success/error)
 * - Clipboard API integration
 * - Error handling and user feedback
 * - Accessibility (ARIA, keyboard navigation)
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { createShare, isApiError } from '@/lib/shareApi'
import type { Conversation } from '@/types'
import { Copy, Check, Share2, Loader2, AlertCircle } from 'lucide-react'

/**
 * Component Props
 */
interface ShareDialogProps {
  /** Whether the dialog is currently open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** The conversation to share (null if no active chat) */
  conversation: Conversation | null
}

/**
 * State type for the share process
 * This is a "state machine" pattern - component can only be in one state at a time
 */
type ShareState =
  | { type: 'idle' }                                    // Initial state
  | { type: 'loading' }                                 // Creating share
  | { type: 'success'; url: string; expiresAt: number } // Share created
  | { type: 'error'; message: string }                  // Failed to create

/**
 * ShareDialog Component
 *
 * State machine flow:
 * idle → (user clicks share) → loading → success/error
 * success/error → (user closes dialog) → idle
 */
export function ShareDialog({ open, onOpenChange, conversation }: ShareDialogProps) {
  // ===== STATE =====
  const [shareState, setShareState] = useState<ShareState>({ type: 'idle' })
  const [copied, setCopied] = useState(false)

  // ===== EFFECTS =====

  /**
   * Auto-create share when dialog opens with a conversation
   * This runs whenever `open` or `conversation` changes
   */
  useEffect(() => {
    // Only create share if:
    // 1. Dialog is open
    // 2. We have a conversation
    // 3. We're in idle state (haven't created yet)
    if (open && conversation && shareState.type === 'idle') {
      handleCreateShare()
    }

    // Reset to idle when dialog closes
    if (!open && shareState.type !== 'idle') {
      setShareState({ type: 'idle' })
      setCopied(false)
    }
  }, [open, conversation])

  // ===== HANDLERS =====

  /**
   * Create share via API
   * Updates state through the state machine flow
   */
  const handleCreateShare = async () => {
    if (!conversation) return

    // Transition: idle → loading
    setShareState({ type: 'loading' })

    try {
      // Call API to create share
      const response = await createShare(conversation)

      // Transition: loading → success
      setShareState({
        type: 'success',
        url: response.url,
        expiresAt: response.expiresAt
      })

      toast.success('Share link created!')
    } catch (error) {
      // Transition: loading → error
      console.error('[ShareDialog] Error creating share:', error)

      let errorMessage = 'Failed to create share link'
      if (isApiError(error)) {
        errorMessage = error.message
      }

      setShareState({
        type: 'error',
        message: errorMessage
      })

      toast.error(errorMessage)
    }
  }

  /**
   * Copy share URL to clipboard
   * Uses the modern Clipboard API
   */
  const handleCopy = async () => {
    if (shareState.type !== 'success') return

    try {
      // Modern browsers: navigator.clipboard.writeText()
      await navigator.clipboard.writeText(shareState.url)

      setCopied(true)
      toast.success('Link copied to clipboard!')

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('[ShareDialog] Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  /**
   * Close dialog handler
   */
  const handleClose = () => {
    onOpenChange(false)
  }

  // ===== VALIDATION =====

  /**
   * Check if sharing is possible
   * Show helpful message if not
   */
  const canShare = conversation && conversation.messages.length > 0

  // ===== RENDER =====

  /**
   * Calculate days until expiration for display
   */
  const daysUntilExpiration = shareState.type === 'success'
    ? Math.ceil((shareState.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Conversation
          </DialogTitle>
          <DialogDescription>
            {shareState.type === 'success'
              ? `Anyone with this link can view this conversation. Link expires in ${daysUntilExpiration} days.`
              : 'Create a shareable link to this conversation.'}
          </DialogDescription>
        </DialogHeader>

        {/* Conditional rendering based on state */}
        <div className="space-y-4">
          {/* ===== IDLE / NO CONVERSATION ===== */}
          {shareState.type === 'idle' && !canShare && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Start a conversation first before sharing.
              </p>
            </div>
          )}

          {/* ===== LOADING STATE ===== */}
          {shareState.type === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Creating share link...
              </p>
            </div>
          )}

          {/* ===== SUCCESS STATE ===== */}
          {shareState.type === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareState.url}
                  readOnly
                  className="flex-1"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-muted rounded-md p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Share details:</p>
                <ul className="space-y-1">
                  <li>• Messages: {conversation?.messages.length || 0}</li>
                  <li>• Expires: {new Date(shareState.expiresAt).toLocaleDateString()}</li>
                  <li>• Access: Read-only (viewers cannot edit)</li>
                </ul>
              </div>
            </div>
          )}

          {/* ===== ERROR STATE ===== */}
          {shareState.type === 'error' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Failed to create share
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    {shareState.message}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreateShare}
                className="w-full"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* ===== FOOTER ACTIONS ===== */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareDialog
