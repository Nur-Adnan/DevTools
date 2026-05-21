import { redis } from "@pulseguard/db"

/**
 * Get a value from the cache, or fetch it and store it if it does not exist.
 * @param key The cache key
 * @param fetcher The function to retrieve the source data if not cached
 * @param ttl Time to live in seconds
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached !== null) {
      return JSON.parse(cached) as T
    }
  } catch (error) {
    // Fail-safe: log cache read failure but proceed to call the fetcher
    console.warn(`Cache read error for key "${key}":`, error)
  }

  const freshData = await fetcher()

  try {
    await redis.set(key, JSON.stringify(freshData), { ex: ttl })
  } catch (error) {
    // Fail-safe: log cache write failure but do not crash the request
    console.warn(`Cache write error for key "${key}":`, error)
  }

  return freshData
}

/**
 * Invalidate a specific cache key.
 * @param key The cache key to delete
 */
export async function invalidate(key: string): Promise<void> {
  await redis.del(key)
}

/**
 * Invalidate all cache keys matching a specific pattern (glob style, e.g. "project:*:logs").
 * @param pattern Glob pattern to search and delete
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys && keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error(`Failed to invalidate cache pattern "${pattern}":`, error)
  }
}

/**
 * ============================================================================
 * Business Query Caching Helpers
 * ============================================================================
 */

interface CachedProject {
  id: string
  name: string
  userId: string
  hashedApiKey: string
  // Additional fields as per schema
}

/**
 * Cache and retrieve a project lookup by its hashed API key.
 * TTL: 5 minutes. Invalidated on API key regeneration.
 */
export async function getCachedProjectByApiKey(
  apiKeyHash: string,
  fetcher: () => Promise<CachedProject | null>
): Promise<CachedProject | null> {
  const key = `project:apikey:${apiKeyHash}`
  return getOrSet(key, fetcher, 300) // 5 minutes = 300 seconds
}

export async function invalidateCachedProjectByApiKey(apiKeyHash: string): Promise<void> {
  const key = `project:apikey:${apiKeyHash}`
  await invalidate(key)
}

/**
 * Cache and retrieve the daily log count for a project.
 * TTL: 1 minute (for fast plan limit enforcement).
 */
export async function getCachedLogCount(
  projectId: string,
  dateStr: string, // YYYY-MM-DD
  fetcher: () => Promise<number>
): Promise<number> {
  const key = `project:${projectId}:logcount:${dateStr}`
  return getOrSet(key, fetcher, 60) // 1 minute = 60 seconds
}

export async function invalidateCachedLogCount(projectId: string, dateStr: string): Promise<void> {
  const key = `project:${projectId}:logcount:${dateStr}`
  await invalidate(key)
}

/**
 * Cache and retrieve the user plan tier (e.g., Free or Pro).
 * TTL: 10 minutes. Invalidated on subscription change.
 */
export async function getCachedUserPlanTier(
  userId: string,
  fetcher: () => Promise<string>
): Promise<string> {
  const key = `user:${userId}:plan`
  return getOrSet(key, fetcher, 600) // 10 minutes = 600 seconds
}

export async function invalidateCachedUserPlanTier(userId: string): Promise<void> {
  const key = `user:${userId}:plan`
  await invalidate(key)
}

