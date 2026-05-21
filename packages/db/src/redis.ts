import { Redis as UpstashRedis } from "@upstash/redis"
import IORedis from "ioredis"

export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, options?: { ex?: number; px?: number }): Promise<any>
  del(...keys: string[]): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  keys(pattern: string): Promise<string[]>
  zadd(key: string, score: number, member: string): Promise<number>
  zremrangebyscore(key: string, min: string | number, max: string | number): Promise<number>
  zcard(key: string): Promise<number>
  zrange(key: string, min: number, max: number, options?: { withScores?: boolean }): Promise<string[]>
  multi(): any
}

class LocalRedisWrapper implements RedisClient {
  private client: IORedis

  constructor() {
    const url = process.env.REDIS_URL || "redis://localhost:6379"
    this.client = new IORedis(url, {
      maxRetriesPerRequest: null,
    })
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, options?: { ex?: number; px?: number }): Promise<any> {
    if (options?.ex) {
      return this.client.set(key, value, "EX", options.ex)
    }
    if (options?.px) {
      return this.client.set(key, value, "PX", options.px)
    }
    return this.client.set(key, value)
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0
    return this.client.del(...keys)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds)
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern)
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member)
  }

  async zremrangebyscore(key: string, min: string | number, max: string | number): Promise<number> {
    return this.client.zremrangebyscore(key, min, max)
  }

  async zcard(key: string): Promise<number> {
    return this.client.zcard(key)
  }

  async zrange(key: string, min: number, max: number, options?: { withScores?: boolean }): Promise<string[]> {
    if (options?.withScores) {
      return this.client.zrange(key, min, max, "WITHSCORES")
    }
    return this.client.zrange(key, min, max)
  }

  multi() {
    return this.client.multi()
  }
}

class UpstashRedisWrapper implements RedisClient {
  private client: UpstashRedis

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) {
      throw new Error("Upstash Redis credentials are required in production mode.")
    }
    this.client = new UpstashRedis({ url, token })
  }

  async get(key: string): Promise<string | null> {
    const res = await this.client.get(key)
    if (res === null) return null
    return typeof res === "string" ? res : JSON.stringify(res)
  }

  async set(key: string, value: string, options?: { ex?: number; px?: number }): Promise<any> {
    const opts: any = {}
    if (options?.ex !== undefined) opts.ex = options.ex
    if (options?.px !== undefined) opts.px = options.px
    return this.client.set(key, value, opts)
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0
    return this.client.del(...keys)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds)
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern)
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const res = await this.client.zadd(key, { score, member })
    return res ?? 0
  }

  async zremrangebyscore(key: string, min: string | number, max: string | number): Promise<number> {
    return this.client.zremrangebyscore(key, min as any, max as any)
  }

  async zcard(key: string): Promise<number> {
    return this.client.zcard(key)
  }

  async zrange(key: string, min: number, max: number, options?: { withScores?: boolean }): Promise<string[]> {
    const opts: any = {}
    if (options?.withScores !== undefined) {
      opts.withScores = options.withScores
    }
    return this.client.zrange(key, min, max, opts) as Promise<string[]>
  }

  multi() {
    return this.client.pipeline()
  }
}

const createRedisClient = (): RedisClient => {
  const mode = process.env.REDIS_MODE || "upstash"
  if (mode === "local" || process.env.NODE_ENV === "test") {
    return new LocalRedisWrapper()
  }
  return new UpstashRedisWrapper()
}

const globalForRedis = globalThis as unknown as { redis: RedisClient }
export const redis = globalForRedis.redis || createRedisClient()
if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis
