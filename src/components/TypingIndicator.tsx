export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div className="rounded-lg px-4 py-3 bg-secondary border border-border">
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-typing-dot"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-typing-dot"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-typing-dot"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  )
}
