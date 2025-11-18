import { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { Chat } from './components/Chat'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { SettingsDialog } from './components/SettingsDialog'
import { AboutDialog } from './components/AboutDialog'
import { Message, Conversation, ApiProvider, ThemeName } from './types'
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
  setTheme as saveTheme,
  getApiProvider,
  setApiProvider as saveApiProvider,
  getApiKey,
  setApiKey as saveApiKey,
  getModel,
  setModel as saveModel
} from './lib/chatStorage'
import { applyTheme } from './lib/themes'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeName>(getTheme() as ThemeName)
  const [chatHistory, setChatHistory] = useState<Conversation[]>([])
  const [currentChatId, setCurrentChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showGaslitLabels, setShowGaslitLabels] = useState(true)
  const [apiProvider, setApiProvider] = useState<ApiProvider>('groq')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const chatIdRef = useRef<string | null>(null)

  // Load chat history and settings on mount
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

    // Load API provider settings
    setApiProvider(getApiProvider() as ApiProvider)
    setApiKey(getApiKey())
    setModel(getModel())
  }, [])

  // Apply theme to document
  useEffect(() => {
    applyTheme(theme)
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
      // Escape: Close dialogs
      if (e.key === 'Escape') {
        if (settingsOpen) setSettingsOpen(false)
        if (aboutOpen) setAboutOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settingsOpen, aboutOpen])

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

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme)
    saveTheme(newTheme)
    toast.success(`Theme changed to ${newTheme.replace('-', ' ')}`)
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

  const handleApiProviderChange = (provider: ApiProvider) => {
    setApiProvider(provider)
    saveApiProvider(provider)
  }

  const handleApiKeyChange = (key: string) => {
    setApiKey(key)
    saveApiKey(key)
  }

  const handleModelChange = (newModel: string) => {
    setModel(newModel)
    saveModel(newModel)
  }

  return (
    <>
      <Toaster
        position="top-center"
        theme={theme === 'default-light' ? 'light' : 'dark'}
        richColors
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        theme={theme}
        onThemeChange={handleThemeChange}
        showGaslitLabels={showGaslitLabels}
        onToggleGaslitLabels={() => setShowGaslitLabels(!showGaslitLabels)}
        onClearChat={handleClearChat}
        onClearAllChats={handleClearAllChats}
        apiProvider={apiProvider}
        onApiProviderChange={handleApiProviderChange}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        model={model}
        onModelChange={handleModelChange}
      />
      <AboutDialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        theme={theme}
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
          onOpenAbout={() => setAboutOpen(true)}
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
            apiProvider={apiProvider}
            apiKey={apiKey}
            model={model}
          />
        </div>
      </div>
    </>
  )
}

export default App
