import { vi, afterEach } from "vitest"

// Mock rate limiting helper controls
export const mockRatelimitLimit = vi.fn().mockResolvedValue({
  success: true,
  limit: 100,
  remaining: 99,
  reset: Date.now() + 60000
})

vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: vi.fn().mockImplementation(() => ({
      limit: mockRatelimitLimit
    }))
  }
})

// In-Memory Mock of Redis featuring ZSET capabilities and Pipeline operations
class InMemoryRedisMock {
  private store = new Map<string, string>()
  private zsets = new Map<string, Array<{ score: number; member: string }>>()

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null
  }

  async set(key: string, value: string, options?: { ex?: number; px?: number }): Promise<string> {
    this.store.set(key, value)
    return "OK"
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0
    for (const key of keys) {
      if (this.store.has(key) || this.zsets.has(key)) {
        this.store.delete(key)
        this.zsets.delete(key)
        deleted++
      }
    }
    return deleted
  }

  async incr(key: string): Promise<number> {
    const val = parseInt(this.store.get(key) || "0", 10) + 1
    this.store.set(key, String(val))
    return val
  }

  async expire(key: string, seconds: number): Promise<number> {
    return 1
  }

  async keys(pattern: string): Promise<string[]> {
    const regexPattern = "^" + pattern.replace(/\*/g, ".*") + "$"
    const regex = new RegExp(regexPattern)
    return Array.from(new Set([...this.store.keys(), ...this.zsets.keys()])).filter((key) =>
      regex.test(key)
    )
  }

  async zadd(key: string, scoreOrOpts: any, memberOrScore?: any): Promise<number> {
    let score = 0
    let member = ""
    if (typeof scoreOrOpts === "object" && scoreOrOpts !== null) {
      score = scoreOrOpts.score
      member = scoreOrOpts.member
    } else {
      score = scoreOrOpts
      member = memberOrScore
    }
    if (!this.zsets.has(key)) {
      this.zsets.set(key, [])
    }
    const zset = this.zsets.get(key)!
    const idx = zset.findIndex(m => m.member === member)
    if (idx !== -1) zset.splice(idx, 1)
    zset.push({ score, member })
    zset.sort((a, b) => a.score - b.score)
    return 1
  }

  async zremrangebyscore(key: string, min: any, max: any): Promise<number> {
    if (!this.zsets.has(key)) return 0
    const zset = this.zsets.get(key)!
    const originalLen = zset.length
    const filtered = zset.filter(m => m.score < min || m.score > max)
    this.zsets.set(key, filtered)
    return originalLen - filtered.length
  }

  async zcard(key: string): Promise<number> {
    return this.zsets.get(key)?.length || 0
  }

  async zrange(key: string, min: number, max: number, options?: { withScores?: boolean }): Promise<string[]> {
    if (!this.zsets.has(key)) return []
    const zset = this.zsets.get(key)!
    const slice = zset.slice(min, max === -1 ? undefined : max + 1)
    if (options?.withScores) {
      return slice.flatMap(m => [m.member, String(m.score)])
    }
    return slice.map(m => m.member)
  }

  multi() {
    const pipeline: any[] = []
    const self = this
    const mockMulti = {
      zremrangebyscore(k: string, min: number, max: number) {
        pipeline.push(() => self.zremrangebyscore(k, min, max))
        return mockMulti
      },
      zadd(k: string, score: any, member?: any) {
        pipeline.push(() => self.zadd(k, score, member))
        return mockMulti
      },
      zcard(k: string) {
        pipeline.push(() => self.zcard(k))
        return mockMulti
      },
      expire(k: string, seconds: number) {
        pipeline.push(() => self.expire(k, seconds))
        return mockMulti
      },
      get(k: string) {
        pipeline.push(() => self.get(k))
        return mockMulti
      },
      del(k: string) {
        pipeline.push(() => self.del(k))
        return mockMulti
      },
      async exec() {
        const results: any[] = []
        for (const fn of pipeline) {
          const res = await fn()
          results.push(res)
        }
        return results
      }
    }
    return mockMulti
  }

  clear() {
    this.store.clear()
    this.zsets.clear()
  }
}

export const mockRedis = new InMemoryRedisMock()

// Chainable mock helper to intercept Prisma methods gracefully
const createPrismaMockProxy = () => {
  const fnMap = new Map<string, any>()
  const mock: any = {}
  
  const handler = {
    get: (target: any, prop: string) => {
      if (prop === "then") return undefined
      if (prop === "catch") return undefined
      
      if (!fnMap.has(prop)) {
        const mockFn = vi.fn().mockImplementation(() => {
          return createPrismaMockProxy()
        })
        fnMap.set(prop, mockFn)
      }
      return fnMap.get(prop)
    }
  }
  return new Proxy(mock, handler)
}

export const mockPrisma = createPrismaMockProxy()

// Intercept DB and Redis package imports
vi.mock("@pulseguard/db", () => {
  return {
    db: mockPrisma,
    redis: mockRedis
  }
})

// Mock Clerk server authentications
vi.mock("@clerk/nextjs/server", () => {
  return {
    auth: vi.fn().mockReturnValue({
      userId: "test-user-id",
      orgId: "test-org-id"
    }),
    currentUser: vi.fn().mockResolvedValue({
      id: "test-user-id",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@example.com" }]
    })
  }
})

afterEach(() => {
  vi.clearAllMocks()
  mockRedis.clear()
  mockRatelimitLimit.mockResolvedValue({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000
  })
})
