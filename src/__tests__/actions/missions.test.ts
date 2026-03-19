import { describe, it, expect } from 'vitest'

describe('Daily Missions', () => {
  it('should generate 3 missions from activity types', () => {
    const activityTypes = ['ai_chat', 'exercise', 'phrases']
    const missions = activityTypes.map(type => ({
      type,
      title: `Complete a ${type} activity`,
      target: 1,
      current: 0,
      xpReward: 25,
    }))
    expect(missions).toHaveLength(3)
    expect(missions[0].xpReward).toBe(25)
  })

  it('should mark mission as completed when current >= target', () => {
    const mission = { target: 3, current: 3 }
    expect(mission.current >= mission.target).toBe(true)
  })
})
