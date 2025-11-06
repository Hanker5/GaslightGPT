import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Edit2, Save, Flame } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { cn } from '@/lib/utils'

export function ChatMessage({ message, onEdit, showGaslitLabel = true }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

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
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent)
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
          "rounded-2xl px-4 py-3 relative",
          isEditing ? "w-full" : "max-w-[70%]",
          isUser
            ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
            : "bg-secondary border border-border",
          isEditing && "ring-2 ring-primary"
        )}
      >
        {message.edited && !isEditing && showGaslitLabel && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-purple-600 rounded-full px-2 py-0.5 shadow-lg">
            <Flame className="h-3 w-3 text-white" />
            <span className="text-xs text-white font-medium">Gaslit!</span>
          </div>
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
                  ? "bg-purple-500/20 text-white placeholder:text-purple-200/50 border-purple-400/30"
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
                className={isUser ? "bg-white text-purple-700 hover:bg-white/90" : ""}
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
                className={isUser ? "border-white/30 text-white hover:bg-white/10" : ""}
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
