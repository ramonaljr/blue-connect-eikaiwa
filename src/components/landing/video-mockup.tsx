export function VideoMockup() {
  return (
    <div className="glass rounded-2xl p-4 shadow-elevated">
      <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
        <span className="text-xs font-medium text-muted-foreground">Live Lesson</span>
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          <span className="size-2 animate-pulse rounded-full bg-destructive" />
          LIVE
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-primary/10">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
            S
          </div>
          <span className="mt-1.5 text-xs font-medium">Sarah T.</span>
          <span className="text-xs text-muted-foreground">Tutor</span>
        </div>
        <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-accent/10">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
            Y
          </div>
          <span className="mt-1.5 text-xs font-medium">You</span>
          <span className="text-xs text-muted-foreground">Learner</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs">🎤</div>
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs">📹</div>
        <div className="flex size-8 items-center justify-center rounded-full bg-destructive/80 text-xs text-white">✕</div>
      </div>
    </div>
  )
}
