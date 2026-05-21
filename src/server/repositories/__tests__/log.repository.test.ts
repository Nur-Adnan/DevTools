import { describe, it, expect, vi, beforeEach } from "vitest"
import { createLog, getLogs, getLogsByFingerprint } from "../log.repository"
import { mockPrisma } from "../../../test/setup"

describe("Log Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should save all fields correctly via createLog", async () => {
    const mockLog = {
      id: "log-123",
      projectId: "project-1",
      type: "ERROR" as const,
      message: "Database connection failed",
      stackTrace: "Error: Database connection failed\n at db.ts:5",
      metadata: { code: 500 },
      source: "scheduler",
      fingerprint: "hash-123",
      createdAt: new Date()
    }

    mockPrisma.log.create.mockResolvedValue(mockLog)

    const result = await createLog({
      projectId: "project-1",
      type: "ERROR",
      message: "Database connection failed",
      stackTrace: "Error: Database connection failed\n at db.ts:5",
      metadata: { code: 500 },
      source: "scheduler",
      fingerprint: "hash-123"
    })

    expect(mockPrisma.log.create).toHaveBeenCalledWith({
      data: {
        projectId: "project-1",
        type: "ERROR",
        message: "Database connection failed",
        stackTrace: "Error: Database connection failed\n at db.ts:5",
        metadata: { code: 500 },
        source: "scheduler",
        fingerprint: "hash-123"
      }
    })
    expect(result).toEqual(mockLog)
  })

  it("should return paginated results in the correct order via getLogs", async () => {
    const mockItems = [
      { id: "log-2", message: "Second log", createdAt: new Date() },
      { id: "log-1", message: "First log", createdAt: new Date(Date.now() - 1000) }
    ]
    const mockTotal = 2

    mockPrisma.log.findMany.mockResolvedValue(mockItems)
    mockPrisma.log.count.mockResolvedValue(mockTotal)

    const result = await getLogs({
      projectId: "project-1",
      page: 1,
      limit: 10
    })

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith({
      where: { projectId: "project-1" },
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" }
    })
    expect(mockPrisma.log.count).toHaveBeenCalledWith({
      where: { projectId: "project-1" }
    })
    expect(result.items).toEqual(mockItems)
    expect(result.total).toBe(2)
    expect(result.totalPages).toBe(1)
  })

  it("should filter logs correctly by fingerprint via getLogsByFingerprint", async () => {
    const mockLogs = [
      { id: "log-3", fingerprint: "fingerprint-xyz", message: "Unique error" }
    ]

    mockPrisma.log.findMany.mockResolvedValue(mockLogs)

    const result = await getLogsByFingerprint("project-1", "fingerprint-xyz")

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith({
      where: {
        projectId: "project-1",
        fingerprint: "fingerprint-xyz"
      },
      orderBy: { createdAt: "desc" }
    })
    expect(result).toEqual(mockLogs)
  })
})
