import { describe, it, expect } from 'vitest'
import { buildTutorSystemPrompt, ROLEPLAY_SCENARIOS } from '@/lib/ai/system-prompts'

describe('System Prompts', () => {
  it('builds a basic text chat prompt with learner info', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'text_chat',
    })
    expect(prompt).toContain('Taro')
    expect(prompt).toContain('A2')
    expect(prompt).toContain('text_chat')
  })

  it('includes personality instructions for strict personality', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'B1',
      mode: 'text_chat',
      personality: 'strict',
    })
    expect(prompt).toContain('professional')
    expect(prompt).toContain('precise')
  })

  it('includes friendly personality by default', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'text_chat',
    })
    expect(prompt).toContain('warm')
    expect(prompt).toContain('encouraging')
  })

  it('includes correction format for text_chat mode with thorough correction', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'text_chat',
      correctionLevel: 'thorough',
    })
    expect(prompt).toContain('[CORRECTION]')
    expect(prompt).toContain('ALL errors')
  })

  it('does NOT include correction format for voice mode', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'voice_guided',
    })
    expect(prompt).not.toContain('[CORRECTION]')
  })

  it('does NOT include correction format for pronunciation mode', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'pronunciation',
    })
    expect(prompt).not.toContain('[CORRECTION]')
  })

  it('includes scenario for roleplay mode', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'B1',
      mode: 'roleplay',
      scenario: 'You are a waiter at a restaurant.',
    })
    expect(prompt).toContain('waiter')
    expect(prompt).toContain('Stay in character')
  })

  it('does not include scenario block when not in roleplay mode', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'B1',
      mode: 'text_chat',
    })
    expect(prompt).not.toContain('Stay in character')
  })

  it('uses moderate correction level by default', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'text_chat',
    })
    expect(prompt).toContain('Correct common errors')
  })

  it('uses gentle correction when specified', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'text_chat',
      correctionLevel: 'gentle',
    })
    expect(prompt).toContain('Only correct major errors')
  })

  it('keeps responses concise for voice modes', () => {
    const prompt = buildTutorSystemPrompt({
      name: 'Taro',
      level: 'A2',
      mode: 'voice_guided',
    })
    expect(prompt).toContain('1-3 sentences for voice mode')
  })

  it('has all expected roleplay scenarios', () => {
    const keys = Object.keys(ROLEPLAY_SCENARIOS)
    expect(keys).toContain('restaurant')
    expect(keys).toContain('job_interview')
    expect(keys).toContain('airport')
    expect(keys).toContain('business_meeting')
    expect(keys).toContain('small_talk')
    expect(keys).toContain('doctor')
    expect(keys).toContain('shopping')
    expect(keys).toContain('hotel')
    expect(keys).toContain('phone_call')
    expect(keys).toContain('custom')
    expect(keys.length).toBeGreaterThanOrEqual(10)
  })

  it('each scenario has required fields', () => {
    for (const [key, scenario] of Object.entries(ROLEPLAY_SCENARIOS)) {
      expect(scenario.name).toBeTruthy()
      expect(scenario.name_ja).toBeTruthy()
      if (key !== 'custom') {
        expect(scenario.prompt).toBeTruthy()
      }
    }
  })
})
