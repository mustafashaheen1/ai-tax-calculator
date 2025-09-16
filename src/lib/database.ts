import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances during development
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient()
  }
  prisma = global.__prisma
}

// Database health check and recovery
export async function ensureDatabaseHealth() {
  try {
    // Simple health check
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)

    // If database is corrupted, try to reconnect
    try {
      await prisma.$disconnect()
      await prisma.$connect()
      return true
    } catch (reconnectError) {
      console.error('Database reconnection failed:', reconnectError)
      return false
    }
  }
}

// Safe database operation wrapper
export async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    await ensureDatabaseHealth()
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    return null
  }
}

export default prisma
