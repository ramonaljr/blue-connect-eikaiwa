import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client so we can observe which tables awardXP
// touches. The key invariant: a duplicate xp_ledger insert (unique-constraint
// violation, code 23505) must NOT result in any users-table mutation, i.e. no
// XP is applied a second time for the same source.
const fromMock = vi.fn()

// awardXP runs as the service role (privileged write), so mock that client.
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({ from: fromMock })),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}))

import { awardXP } from '@/lib/actions/progress'

describe('awardXP idempotency', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  it('does not apply XP when the ledger insert is a duplicate', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'xp_ledger') {
        return { insert: vi.fn().mockResolvedValue({ error: { code: '23505' } }) }
      }
      // Any other table access would indicate XP was (wrongly) being applied.
      return {}
    })

    await awardXP('user-1', 30, 'ai_chat', 'conversation-1')

    const touchedTables = fromMock.mock.calls.map((c) => c[0])
    expect(touchedTables).toContain('xp_ledger')
    expect(touchedTables).not.toContain('users')
  })

  it('writes to the ledger with the dedup key fields', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '23505' } })
    fromMock.mockImplementation((table: string) =>
      table === 'xp_ledger' ? { insert } : {}
    )

    await awardXP('user-1', 30, 'ai_chat', 'conversation-1')

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', source: 'ai_chat', source_id: 'conversation-1' })
    )
  })
})
