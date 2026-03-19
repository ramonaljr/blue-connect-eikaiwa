import { Redis } from '@upstash/redis'

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export async function checkAIChatLimit(
  userId: string,
  tier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (tier === 'pro' || tier === 'premium') {
    return { allowed: true, remaining: -1 }
  }

  const redis = getRedis()
  const key = `ai-chat:${userId}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 86400)
  }

  return {
    allowed: count <= 3,
    remaining: Math.max(0, 3 - count),
  }
}

export async function checkAIVoiceLimit(
  userId: string,
  tier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (tier === 'free') {
    return { allowed: false, remaining: 0 }
  }

  if (tier === 'premium') {
    return { allowed: true, remaining: -1 }
  }

  const redis = getRedis()
  const key = `ai-voice:${userId}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 86400)
  }

  return {
    allowed: count <= 5,
    remaining: Math.max(0, 5 - count),
  }
}
