import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Flame } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Card } from './ui/card'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'

export function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGaslitLabels, setShowGaslitLabels] = useState(true)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
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

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ **Error:** ${error.message}\n\nPlease check:\n- Server is running\n- API key is configured\n- Internet connection is active`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([])
    }
  }

  const handleEditMessage = (messageId, newContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
      )
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-background/95">
      {/* Header */}
      <header className="border-b bg-[#2d3338]">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <img
                src="/glgpt-logo.png"
                alt="GaslightGPT Logo"
                className="h-16 md:h-24 w-auto rounded-lg border border-border/50 shadow-lg"
              />
              <div className="border-l border-border/40 pl-3 md:pl-4">
                <p className="text-xs md:text-sm text-muted-foreground/80">
                  Disclaimer: this site has no affiliation with ChatGPT or OpenAI.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground/80 hidden sm:block">
                  It is just a personal project to explore the behaviors and functionality of AI.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGaslitLabels(!showGaslitLabels)}
                className="gap-2"
              >
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">{showGaslitLabels ? 'Hide Gaslit Labels' : 'Show Gaslit Labels'}</span>
                <span className="sm:hidden">{showGaslitLabels ? 'Hide Labels' : 'Show Labels'}</span>
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearChat}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Chat</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden shadow-2xl">
          {/* Messages */}
          <ScrollArea
            ref={scrollRef}
            className="flex-1 p-6 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                <div>
                  <p className="text-lg mb-2">Welcome to GaslightGPT</p>
                  <p className="text-sm">Start a conversation by typing a message below</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onEdit={handleEditMessage}
                    showGaslitLabel={showGaslitLabels}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2 items-stretch">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="min-h-[44px] max-h-[200px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[56px] w-[56px] shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
