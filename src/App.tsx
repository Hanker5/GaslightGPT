import { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { Chat } from './components/Chat'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { SettingsDialog } from './components/SettingsDialog'
import { Message, Conversation } from './types'
import {
  getAllChats,
  saveChat,
  deleteChat,
  getChatById,
  generateChatTitle,
  setCurrentChatId,
  getCurrentChatId,
  clearAllChats,
  getTheme,
  setTheme as saveTheme
} from './lib/chatStorage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme())
  const [chatHistory, setChatHistory] = useState<Conversation[]>([])
  const [currentChatId, setCurrentChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showGaslitLabels, setShowGaslitLabels] = useState(true)
  const chatIdRef = useRef<string | null>(null)

  // Load chat history on mount
  useEffect(() => {
    const chats = getAllChats()
    setChatHistory(chats)

    // Load last active chat if exists
    const lastChatId = getCurrentChatId()
    if (lastChatId) {
      const chat = getChatById(lastChatId)
      if (chat) {
        chatIdRef.current = chat.id
        setCurrentChat(chat.id)
        setMessages(chat.messages)
      }
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Save current chat when messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      // Get existing chat to preserve createdAt
      const existingChat = getChatById(currentChatId)
      const chat: Conversation = {
        id: currentChatId,
        title: generateChatTitle(messages),
        messages: messages,
        updatedAt: Date.now(),
        createdAt: existingChat?.createdAt || Date.now()
      }
      saveChat(chat)
      // Refresh chat history
      setChatHistory(getAllChats())
    }
  }, [messages, currentChatId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K: New chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleNewChat()
      }
      // Escape: Close settings dialog
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settingsOpen])

  const handleNewChat = () => {
    const newChatId = String(Date.now())
    chatIdRef.current = newChatId
    setCurrentChat(newChatId)
    setCurrentChatId(newChatId)
    setMessages([])
    setSidebarOpen(false)
    toast.success('Started new chat')
  }

  const handleSelectChat = (chatId: string) => {
    const chat = getChatById(chatId)
    if (chat) {
      chatIdRef.current = chat.id
      setCurrentChat(chat.id)
      setCurrentChatId(chat.id)
      setMessages(chat.messages)
      setSidebarOpen(false)
    }
  }

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId)
    setChatHistory(getAllChats())
    // If deleting current chat, clear it
    if (currentChatId === chatId) {
      chatIdRef.current = null
      setMessages([])
      setCurrentChat(null)
      setCurrentChatId(null)
    }
    toast.success('Chat deleted')
  }

  const handleClearChat = () => {
    if (currentChatId) {
      deleteChat(currentChatId)
      setChatHistory(getAllChats())
      toast.success('Current chat cleared')
    }
    chatIdRef.current = null
    setMessages([])
    setCurrentChat(null)
    setCurrentChatId(null)
    setSettingsOpen(false)
  }

  const handleClearAllChats = () => {
    clearAllChats()
    chatIdRef.current = null
    setChatHistory([])
    setMessages([])
    setCurrentChat(null)
    setCurrentChatId(null)
    setSettingsOpen(false)
    toast.success('All chat history cleared')
  }

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    saveTheme(newTheme)
  }

  const handleMessagesUpdate = (newMessages: Message[]) => {
    // If this is the first message and no chat ID exists, create one BEFORE updating messages
    // Use ref to prevent race condition when API responds quickly
    if (!chatIdRef.current && newMessages.length > 0) {
      const newChatId = String(Date.now())
      chatIdRef.current = newChatId
      setCurrentChat(newChatId)
      setCurrentChatId(newChatId)
    }

    setMessages(newMessages)
  }

  return (
    <>
      <Toaster position="top-center" theme={theme} richColors />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        showGaslitLabels={showGaslitLabels}
        onToggleGaslitLabels={() => setShowGaslitLabels(!showGaslitLabels)}
        onClearChat={handleClearChat}
        onClearAllChats={handleClearAllChats}
      />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onOpenSettings={() => setSettingsOpen(true)}
          chatHistory={chatHistory}
          currentChatId={currentChatId}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Chat
            messages={messages}
            onMessagesUpdate={handleMessagesUpdate}
            showGaslitLabels={showGaslitLabels}
          />
        </div>
      </div>
    </>
  )
}

export default App
