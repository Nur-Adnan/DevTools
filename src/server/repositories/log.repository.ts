import { db } from "@pulseguard/db"

export interface CreateLogInput {
  projectId: string
  type: "INFO" | "WARN" | "ERROR"
  message: string
  stackTrace?: string | null
  metadata?: any
  source?: string | null
  fingerprint?: string | null
}

/**
 * Creates a log entry under a specific project.
 */
export async function createLog(data: CreateLogInput) {
  return db.log.create({
    data: {
      projectId: data.projectId,
      type: data.type,
      message: data.message,
      stackTrace: data.stackTrace || null,
      metadata: data.metadata || null,
      source: data.source || null,
      fingerprint: data.fingerprint || null
    }
  })
}

export interface GetLogsOptions {
  projectId: string
  page?: number
  limit?: number
  type?: "INFO" | "WARN" | "ERROR"
}

/**
 * Returns paginated logs for a project sorted newest first.
 */
export async function getLogs(options: GetLogsOptions) {
  const page = options.page || 1
  const limit = options.limit || 20
  const skip = (page - 1) * limit

  const where: any = {
    projectId: options.projectId
  }
  if (options.type) {
    where.type = options.type
  }

  const [items, total] = await Promise.all([
    db.log.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    db.log.count({ where })
  ])

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Retrieve all logs matching a specific fingerprint (error group).
 */
export async function getLogsByFingerprint(projectId: string, fingerprint: string) {
  return db.log.findMany({
    where: {
      projectId,
      fingerprint
    },
    orderBy: { createdAt: "desc" }
  })
}
