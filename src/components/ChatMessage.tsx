import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Edit2, Save, Flame } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import { Message } from '@/types'

interface ChatMessageProps {
  message: Message
  onEdit: (messageId: number, newContent: string) => void
  showGaslitLabel?: boolean
}

export function ChatMessage({ message, onEdit, showGaslitLabel = true }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isUser = message.role === 'user'

  // Auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      textareaRef.current.focus()
    }
  }, [isEditing, editedContent])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent)
      toast.success('Message updated')
    }
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    if (!isEditing) {
      setIsEditing(true)
      setEditedContent(message.content)
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 animate-fade-in group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleStartEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-3 relative",
          isEditing ? "w-full" : "max-w-[70%]",
          isUser
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-secondary border border-border",
          isEditing && "ring-2 ring-primary"
        )}
      >
        {message.edited && !isEditing && showGaslitLabel && (
          <Badge className="absolute -top-2 -right-2 bg-orange-500 dark:bg-orange-600 text-white border-none hover:bg-orange-500 shadow-sm gap-1">
            <Flame className="h-3 w-3" />
            Gaslit!
          </Badge>
        )}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={cn(
                "min-h-[60px] resize-none overflow-hidden w-full",
                isUser
                  ? "bg-primary/10 border-primary/30"
                  : "bg-background border-border"
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className={isUser ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : ""}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(message.content)
                }}
                className={isUser ? "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" : ""}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="message-content prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleStartEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
