import Logo from './Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  X
} from 'lucide-react'
import { Conversation } from '@/types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onOpenSettings: () => void
  chatHistory?: Conversation[]
  currentChatId: string | null
}

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
  chatHistory = [],
  currentChatId,
}: SidebarProps) {

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'w-[260px] bg-secondary border-r border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-lg font-semibold">GaslightGPT</span>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2"
            variant="default"
          >
            <Plus className="h-5 w-5" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
              Chat History
            </h3>
            {chatHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4">
                No chats yet
              </p>
            ) : (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="group relative flex items-center gap-1 min-w-0">
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={cn(
                        'flex-1 text-left px-2 py-2 rounded-md',
                        'flex items-start gap-2',
                        'hover:bg-accent transition-colors',
                        'text-sm min-w-0',
                        currentChatId === chat.id && 'bg-accent'
                      )}
                    >
                      <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="truncate flex-1 min-w-0">{chat.title}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings Button */}
        <div className="border-t border-border">
          <Button
            variant="ghost"
            onClick={onOpenSettings}
            className="w-full justify-start gap-2 px-4 py-3 h-auto rounded-none"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
