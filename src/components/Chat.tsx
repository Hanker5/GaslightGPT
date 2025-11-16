import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { Message } from '@/types'

interface ChatProps {
  messages?: Message[]
  onMessagesUpdate: (messages: Message[]) => void
  showGaslitLabels?: boolean
}

export function Chat({ messages = [], onMessagesUpdate, showGaslitLabels = true }: ChatProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Focus textarea on mount and when messages become empty
  useEffect(() => {
    textareaRef.current?.focus()
  }, [messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    }

    const newMessages = [...messages, userMessage]
    onMessagesUpdate(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
      }

      onMessagesUpdate([...newMessages, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to send message: ${errorMsg}`)
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ **Error:** ${errorMsg}\n\nPlease check:\n- Server is running\n- API key is configured\n- Internet connection is active`,
      }
      onMessagesUpdate([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEditMessage = (messageId: number, newContent: string) => {
    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
    )
    onMessagesUpdate(updatedMessages)
  }

  // Empty state - centered prompt with centered input
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {/* Prompt */}
          <h1 className="text-3xl md:text-4xl font-medium text-foreground">
            How can you gaslight me today?
          </h1>

          {/* Input */}
          <div className="w-full max-w-2xl">
            <div className="relative flex items-center gap-2 bg-secondary border border-border p-2 rounded-xl shadow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-0"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[56px] w-[56px] shrink-0 rounded-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active state - messages with bottom-fixed input
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6"
      >
        <div className="max-w-4xl mx-auto py-4 sm:py-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onEdit={handleEditMessage}
              showGaslitLabel={showGaslitLabels}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="border-t bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="relative flex items-center gap-2 bg-secondary border border-border p-2 rounded-xl shadow-sm">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-0"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[56px] w-[56px] shrink-0 rounded-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
