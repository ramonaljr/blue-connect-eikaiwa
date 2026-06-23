import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TiltCard } from '../tilt-card'

function mockMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: query.includes('reduce') ? reduced : false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  )
}

describe('TiltCard', () => {
  it('renders its children', () => {
    mockMatchMedia(false)
    render(
      <TiltCard>
        <span>hello</span>
      </TiltCard>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('enables tilt on capable devices', () => {
    mockMatchMedia(false)
    const { container } = render(
      <TiltCard>
        <span>hi</span>
      </TiltCard>,
    )
    expect((container.firstChild as HTMLElement).dataset.tilt).toBe('on')
  })

  it('disables tilt when the user prefers reduced motion', () => {
    mockMatchMedia(true)
    const { container } = render(
      <TiltCard>
        <span>hi</span>
      </TiltCard>,
    )
    expect((container.firstChild as HTMLElement).dataset.tilt).toBe('off')
    expect(screen.getByText('hi')).toBeInTheDocument()
  })
})
