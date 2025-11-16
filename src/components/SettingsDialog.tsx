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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Flame, Trash2, Palette } from 'lucide-react'
import { ThemeName } from '@/types'
import { themes } from '@/lib/themes'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: ThemeName
  onThemeChange: (theme: ThemeName) => void
  showGaslitLabels: boolean
  onToggleGaslitLabels: () => void
  onClearChat: () => void
  onClearAllChats: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
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
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label htmlFor="theme-select" className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger id="theme-select">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(themes).map((themeOption) => (
                  <SelectItem key={themeOption.name} value={themeOption.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{themeOption.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {themeOption.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
