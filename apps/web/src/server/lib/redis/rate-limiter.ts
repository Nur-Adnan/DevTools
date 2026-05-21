import { redis } from "@pulseguard/db"

export async function rateLimit(options: {
  key: string
  limit: number
  window: number
}): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { key, limit, window } = options
  const now = Date.now()
  const clearBefore = now - window * 1000
  // Unique member to prevent collisions on same-millisecond requests
  const member = `${now}-${Math.random().toString(36).substring(2, 9)}`

  const p = redis.multi()
  p.zremrangebyscore(key, 0, clearBefore)
  p.zadd(key, now, member)
  p.zcard(key)
  p.expire(key, window)

  const results = await p.exec()
  if (!results || results.length < 3) {
    throw new Error("Failed to execute rate limiter pipeline")
  }

  // Parse result value dynamically based on client return type (ioredis vs upstash)
  const zcardRaw = results[2]
  let count = 0
  if (Array.isArray(zcardRaw)) {
    // ioredis returns [err, val]
    count = typeof zcardRaw[1] === "number" ? zcardRaw[1] : parseInt(String(zcardRaw[1]), 10) || 0
  } else {
    // upstash pipeline returns raw val
    count = typeof zcardRaw === "number" ? zcardRaw : parseInt(String(zcardRaw), 10) || 0
  }

  const success = count <= limit
  const remaining = Math.max(0, limit - count)
  const reset = Math.ceil((now + window * 1000) / 1000)

  return {
    success,
    remaining,
    reset
  }
}
