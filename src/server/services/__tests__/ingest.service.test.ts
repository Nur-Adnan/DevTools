import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../../../../apps/web/app/api/ingest/route"
import { mockPrisma, mockRatelimitLimit } from "../../../test/setup"
import crypto from "crypto"

describe("Ingest Service API", () => {
  const mockApiKey = "pg_test_12345"
  const mockHashedApiKey = crypto.createHash("sha256").update(mockApiKey).digest("hex")

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should successfully ingest a valid log and upsert a LogGroup", async () => {
    // 1. Setup Mock DB entries
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "project-1",
      hashedApiKey: mockHashedApiKey
    })
    mockPrisma.log.create.mockResolvedValue({
      id: "log-1",
      createdAt: new Date()
    })
    mockPrisma.logGroup.upsert.mockResolvedValue({
      id: "group-1"
    })

    // 2. Build Request object
    const req = new Request("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${mockApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "ERROR",
        message: "Failed to connect to database",
        stackTrace: "Error: Failed to connect to database\n at index.ts:10",
        metadata: { env: "production" },
        source: "backend"
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveProperty("id", "log-1")

    expect(mockPrisma.log.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectId: "project-1",
        type: "ERROR",
        message: "Failed to connect to database"
      })
    })
    expect(mockPrisma.logGroup.upsert).toHaveBeenCalled()
  })

  it("should reject invalid API keys with 401 error", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null)
    // Also mock findMany for safety fallback checks
    mockPrisma.project.findMany.mockResolvedValue([])

    const req = new Request("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "authorization": "Bearer invalid_key",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "INFO",
        message: "Test message"
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toMatch(/Invalid API key/)
  })

  it("should reject oversized metadata payloads over 10KB with 400 error", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "project-1",
      hashedApiKey: mockHashedApiKey
    })

    const largeMetadata: Record<string, string> = {}
    for (let i = 0; i < 500; i++) {
      largeMetadata[`key_${i}`] = "x".repeat(50) // Easily exceeds 10KB
    }

    const req = new Request("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${mockApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "WARN",
        message: "Oversized payload test",
        metadata: largeMetadata
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/payload size exceeds 10KB/)
  })

  it("should correctly compute log fingerprints for error grouping", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "project-1",
      hashedApiKey: mockHashedApiKey
    })
    mockPrisma.log.create.mockResolvedValue({
      id: "log-2",
      createdAt: new Date()
    })

    const message = "Custom runtime error"
    const firstLineOfStack = "Error: Custom runtime error"
    const expectedFingerprint = crypto
      .createHash("sha256")
      .update(`ERROR:${message}:${firstLineOfStack}`)
      .digest("hex")

    const req = new Request("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${mockApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "ERROR",
        message,
        stackTrace: `${firstLineOfStack}\n at server.ts:25\n at route.ts:12`
      })
    })

    await POST(req)

    expect(mockPrisma.log.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fingerprint: expectedFingerprint
      })
    })
  })

  it("should reject ingestion with 429 when rate limit is exceeded", async () => {
    mockRatelimitLimit.mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 60000
    })

    const req = new Request("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${mockApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "INFO",
        message: "Should be rate limited"
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toMatch(/Rate limit exceeded/)
  })
})
