import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Flame, Sun, Moon, Trash2 } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  showGaslitLabels: boolean
  onToggleGaslitLabels: () => void
  onClearChat: () => void
  onClearAllChats: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onToggleTheme,
  showGaslitLabels,
  onToggleGaslitLabels,
  onClearChat,
  onClearAllChats,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your GaslightGPT experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme-switch" className="text-base">
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'Dark' : 'Light'} mode
              </p>
            </div>
            <Button
              id="theme-switch"
              variant="outline"
              size="sm"
              onClick={onToggleTheme}
              className="gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4" />
                  Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Light
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Gaslit Labels Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gaslit-switch" className="text-base flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Gaslit Labels
              </Label>
              <p className="text-sm text-muted-foreground">
                Show "Gaslit!" badge on edited messages
              </p>
            </div>
            <Switch
              id="gaslit-switch"
              checked={showGaslitLabels}
              onCheckedChange={onToggleGaslitLabels}
            />
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <Label className="text-base text-destructive">Danger Zone</Label>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearChat}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear Current Chat
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onClearAllChats}
              className="w-full justify-start gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Chat History
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
