// Centralized capture point for errors and product events.
//
// Today this emits structured JSON to the platform logs (Vercel/host capture),
// which is a large step up from scattered `console.error` calls: every capture
// carries a scope and context, so failures in money/AI paths are greppable and
// alertable. It is also the single integration seam for a hosted backend —
// wire Sentry (errors) and/or PostHog (events) in the marked spots below and
// every existing call site starts reporting with no further changes.

type Context = Record<string, unknown>

export function captureException(error: unknown, context?: Context): void {
  const payload = {
    type: 'exception',
    level: 'error',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    at: new Date().toISOString(),
  }
  // Integration point: Sentry.captureException(error, { extra: context })
  console.error('[capture]', JSON.stringify(payload))
}

export function captureEvent(name: string, context?: Context): void {
  const payload = { type: 'event', name, ...context, at: new Date().toISOString() }
  // Integration point: posthog.capture(name, context)
  console.log('[event]', JSON.stringify(payload))
}
