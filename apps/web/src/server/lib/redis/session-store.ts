import { redis } from "@pulseguard/db"

/**
 * Set a transient token payload with an automatic expiration time.
 * @param token The unique one-time token
 * @param payload The object to store
 * @param ttlSeconds Expiration duration in seconds (defaults to 60s)
 */
export async function setOneTimeToken(
  token: string,
  payload: object,
  ttlSeconds: number = 60
): Promise<void> {
  const key = `token:${token}`
  await redis.set(key, JSON.stringify(payload), { ex: ttlSeconds })
}

/**
 * Retrieve and immediately delete a one-time token payload.
 * Guaranteeing it can never be read or reused again.
 * @param token The unique one-time token to consume
 */
export async function consumeOneTimeToken(token: string): Promise<object | null> {
  const key = `token:${token}`
  
  // Use a transactional multi/pipeline block to fetch and delete atomically
  const p = redis.multi()
  p.get(key)
  p.del(key)
  
  const results = await p.exec()
  if (!results || results.length < 2) {
    return null
  }

  const getRaw = results[0]
  let data: string | null = null
  
  if (Array.isArray(getRaw)) {
    // ioredis returns [err, val]
    data = typeof getRaw[1] === "string" ? getRaw[1] : null
  } else {
    // upstash pipeline returns raw val
    data = typeof getRaw === "string" ? getRaw : null
  }

  if (!data) return null

  try {
    return JSON.parse(data) as object
  } catch (error) {
    console.error("Failed to parse token payload:", error)
    return null
  }
}
