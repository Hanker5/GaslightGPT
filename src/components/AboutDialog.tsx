import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Flame,
  Lightbulb,
  Drama,
  Bot,
  Target,
  Tag,
  Wrench,
  Smartphone,
  Pizza
} from 'lucide-react'
import { ThemeName } from '@/types'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: ThemeName
}

// Map theme names to SVG suffixes (light or dark)
const getThemeSuffix = (theme: ThemeName): string => {
  // Map all themes to either 'light' or 'dark'
  const themeMap: Record<ThemeName, string> = {
    'default-light': 'light',
    'default-dark': 'dark',
    'midnight-galaxy': 'dark',
    'ocean-breeze': 'light',
    'sunset-glow': 'light'
  }
  return themeMap[theme] || 'light'
}

export function AboutDialog({ open, onOpenChange, theme }: AboutDialogProps) {
  const themeSuffix = getThemeSuffix(theme)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 [&>button]:z-20">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10 pr-14">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Flame className="h-6 w-6 text-orange-500" />
            What is GaslightGPT?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm leading-relaxed px-6 py-4 overflow-y-auto">
          {/* Introduction */}
          <section>
            <p className="text-base">
              Welcome to <span className="font-semibold text-primary">GaslightGPT</span> — where you get to rewrite history,
              one message at a time. <Flame className="inline h-4 w-4 text-orange-500" />
            </p>
          </section>

          {/* What is Gaslighting? */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" /> First, What is Gaslighting?
            </h3>
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <p className="italic text-muted-foreground">
                "Did I say that? No, I definitely didn't say that. You must be remembering wrong..."
              </p>
              <p>
                <strong>Gaslighting</strong> is a form of psychological manipulation where someone makes you question
                your own memory or perception of reality. Named after the 1944 film <em>Gaslight</em>, it's when
                someone insists that your version of events is wrong—even when you know you're right.
              </p>
            </div>
          </section>

          {/* Fun Gaslight Scenario */}
          <section className="space-y-3">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <Drama className="h-10 w-10 flex-shrink-0 text-orange-600 dark:text-orange-500" />
                <div className="space-y-2 flex-1">
                  <p className="font-medium">Classic Gaslight Scenario:</p>
                  <div className="space-y-1 text-sm">
                    <p><strong>You:</strong> "You said we'd meet at 3pm."</p>
                    <p><strong>Friend:</strong> "No I didn't. I said 4pm. You never listen!"</p>
                    <p className="text-muted-foreground italic flex items-center gap-1">
                      *checks phone* ...it says 3pm <Smartphone className="inline h-3 w-3" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How AI Works */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> So How Do AI Chatbots Actually Work?
            </h3>
            <p>
              Here's the thing most people don't realize: <strong>AI doesn't have memory</strong>.
              Not in the way you think, anyway.
            </p>
            <p>
              Every time you send a message, the AI receives the <em>entire conversation history</em> as
              context. It's like you're handing it a full transcript each turn and saying,
              "Here's what we've talked about—now respond."
            </p>

            <div className="my-4">
              <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-border">
                <img
                  src={`/ai-context-diagram-${themeSuffix}.svg`}
                  alt="Diagram showing how AI receives full conversation history with each message"
                  className="max-w-xl w-full h-auto"
                />
              </div>
            </div>

            <p>
              The AI doesn't "remember" your first question. It's just reading the transcript you keep showing it.
            </p>
          </section>

          {/* The Gaslight Moment */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" /> The Gaslight Moment
            </h3>
            <p>
              Now here's where it gets fun. What if you could <strong>edit the transcript</strong>?
            </p>
            <p>
              In most chat apps, messages are locked once sent. But GaslightGPT lets you edit
              <em> both sides</em> of the conversation—yours <strong>and</strong> the AI's.
            </p>

            <div className="my-4">
              <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-border">
                <img
                  src={`/ai-gaslight-diagram-${themeSuffix}.svg`}
                  alt="Diagram showing how editing AI responses gaslights the AI"
                  className="max-w-lg w-full h-auto"
                />
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Flame className="h-4 w-4" />
                You've just gaslit an AI.
              </p>
              <p className="text-sm">
                The AI now "remembers" saying something it never actually said. It will defend that
                false history because, from its perspective, that's what's in the transcript.
              </p>
            </div>
          </section>

          {/* Why This Matters */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Why Does This Matter?
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Educational:</strong> Understanding how AI context windows work helps you use
                AI tools more effectively. You're not talking to a brain—you're shaping a conversation thread.
              </p>
              <p>
                <strong>Experimental:</strong> Want to see how the AI responds when its "memory" contradicts
                logic? Edit away and find out!
              </p>
              <p>
                <strong>Fun:</strong> Sometimes it's just entertaining to make Claude insist it recommended
                pineapple pizza when you <em>know</em> it would never. <Pizza className="inline h-4 w-4" />
              </p>
            </div>
          </section>

          {/* The Gaslit Badge */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> The "Gaslit!" Badge
            </h3>
            <p>
              Every edited message gets tagged with our signature orange flame badge:
              <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-500 text-xs font-medium border border-orange-500/20">
                <Flame className="h-3 w-3" />
                Gaslit!
              </span>
            </p>
            <p>
              Think of it as a "this is not the original timeline" marker. You can toggle these badges
              in the settings if you want to hide the evidence of your reality manipulation.
            </p>
          </section>

          {/* Technical Details */}
          <section className="space-y-3 border-t border-border pt-4">
            <h3 className="text-base font-semibold text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Technical Bits (for the curious)
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                • Built with React 18, TypeScript, and Tailwind CSS<br />
                • Supports multiple AI providers (OpenAI, Anthropic, Groq)<br />
                • Full conversation history stored locally in your browser<br />
                • Edit both user and assistant messages in real-time<br />
                • Open source on GitHub
              </p>
            </div>
          </section>

          {/* Footer */}
          <section className="text-center pt-4 border-t border-border pb-2">
            <p className="text-sm text-muted-foreground italic flex items-center justify-center gap-2">
              Remember: With great power comes great responsibility... to mess with AI. <Flame className="h-4 w-4 text-orange-500" />
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
