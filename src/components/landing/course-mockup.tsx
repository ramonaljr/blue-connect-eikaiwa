export function CourseMockup() {
  const courses = [
    { title: 'Business English', level: 'B1', progress: 72, color: 'bg-primary' },
    { title: 'Daily Conversation', level: 'A2', progress: 45, color: 'bg-[oklch(0.65_0.18_155)]' },
    { title: 'TOEIC Prep', level: 'B2', progress: 30, color: 'bg-accent' },
  ]

  return (
    <div className="glass rounded-2xl p-4 shadow-elevated">
      <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
        <span className="text-xs font-medium text-muted-foreground">My Courses</span>
        <span className="text-xs text-primary">3 active</span>
      </div>
      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.title} className="rounded-xl bg-background/60 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">{course.title}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{course.level}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} />
            </div>
            <span className="mt-1 text-xs text-muted-foreground">{course.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
