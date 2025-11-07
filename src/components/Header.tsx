import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Disclaimer Text */}
          <div className="flex-1 text-center lg:text-left lg:ml-4">
            <p className="text-xs text-muted-foreground/60">
              Disclaimer: this site has no affiliation with ChatGPT or OpenAI.
              <span className="hidden md:inline">
                {' '}It is just a personal project to explore the behaviors and functionality of AI.
              </span>
            </p>
          </div>

          {/* Spacer for mobile to keep disclaimer centered */}
          <div className="w-10 lg:hidden" />
        </div>
      </div>
    </header>
  )
}
