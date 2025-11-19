import { Button } from '@/components/ui/button'
import { Menu, Share2 } from 'lucide-react'
import Logo from './Logo'

interface HeaderProps {
  onToggleSidebar: () => void
  onShare?: () => void           // NEW: Optional share handler
  canShare?: boolean              // NEW: Whether sharing is enabled
}

export default function Header({ onToggleSidebar, onShare, canShare = false }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Hamburger Menu + Logo (mobile) */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="lg:hidden">
              <Logo size={32} />
            </div>
          </div>

          {/* Disclaimer Text */}
          <div className="flex-1 text-center lg:text-left lg:ml-4">
            <p className="text-xs text-muted-foreground/60">
              Disclaimer: this site has no affiliation with ChatGPT or OpenAI.
              <span className="hidden md:inline">
                {' '}It is just a personal project to explore the behaviors and functionality of AI.
              </span>
            </p>
          </div>

          {/* Share Button - NEW */}
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              disabled={!canShare}
              className="gap-2"
              title={canShare ? 'Share this conversation' : 'Start a conversation to share'}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}

          {/* Spacer for mobile when no share button */}
          {!onShare && <div className="w-10 lg:hidden" />}
        </div>
      </div>
    </header>
  )
}
